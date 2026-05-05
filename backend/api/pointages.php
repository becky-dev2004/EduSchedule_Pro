<?php
// ============================================
// EduSchedule Pro — API Pointage QR-Code
// ============================================

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// GET /api/creneaux/{id}/qr — Générer QR-Code
if ($method === 'GET' && str_contains($uri, 'qr')) {
    $userData = protegerRoute(['administrateur']);
    $id_creneau = $_GET['id'] ?? null;

    if (!$id_creneau) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID créneau requis']);
        exit;
    }

    $pdo = getConnexion();
    $stmt = $pdo->prepare("SELECT * FROM creneaux WHERE id = ?");
    $stmt->execute([$id_creneau]);
    $creneau = $stmt->fetch();

    if (!$creneau) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Créneau non trouvé']);
        exit;
    }

    // Générer le token QR
    $token = hash_hmac('sha256', $id_creneau . time() . QR_SECRET, QR_SECRET);
    $expire = date('Y-m-d H:i:s', strtotime('+' . QR_FENETRE_MINUTES . ' minutes'));

    // Sauvegarder le token
    $stmt = $pdo->prepare("UPDATE creneaux SET qr_token = ?, qr_expire = ? WHERE id = ?");
    $stmt->execute([$token, $expire, $id_creneau]);

    echo json_encode([
        'success' => true,
        'token' => $token,
        'expire' => $expire,
        'url_scan' => BASE_URL . '/scan?token=' . $token
    ]);
    exit;
}

// POST /api/pointages/scan — Valider le scan
if ($method === 'POST' && str_contains($uri, 'scan')) {
    $userData = protegerRoute(['enseignant']);
    $data = json_decode(file_get_contents('php://input'), true);
    $token_qr = $data['token_qr'] ?? '';

    if (empty($token_qr)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Token QR requis']);
        exit;
    }

    $pdo = getConnexion();

    // Vérifier le token
    $stmt = $pdo->prepare("
        SELECT cr.*, et.semaine_debut 
        FROM creneaux cr
        JOIN emploi_temps et ON cr.id_emploi_temps = et.id
        WHERE cr.qr_token = ? 
        AND cr.qr_expire > NOW()
        AND cr.id_enseignant = ?
    ");
    $stmt->execute([$token_qr, $userData['id_lien']]);
    $creneau = $stmt->fetch();

    if (!$creneau) {
        // Log tentative échouée
        $stmt_log = $pdo->prepare("INSERT INTO logs_activite (id_utilisateur, action, details_json, ip) VALUES (?, 'scan_qr_echec', ?, ?)");
        $stmt_log->execute([$userData['id'], json_encode(['token' => $token_qr]), $_SERVER['REMOTE_ADDR']]);

        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'QR-Code invalide, expiré ou non autorisé']);
        exit;
    }

    // Vérifier que ce token n'a pas déjà été utilisé
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM pointages WHERE id_creneau = ?");
    $stmt->execute([$creneau['id']]);
    if ($stmt->fetchColumn() > 0) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Ce QR-Code a déjà été utilisé']);
        exit;
    }

    // Déterminer le statut (retard si > 30 min)
    $heure_prevue = $creneau['heure_debut'];
    $heure_reelle = date('H:i:s');
    $diff_minutes = (strtotime($heure_reelle) - strtotime($heure_prevue)) / 60;
    $statut = $diff_minutes > RETARD_ALERTE_MINUTES ? 'retard' : 'valide';

    // Enregistrer le pointage
    $stmt = $pdo->prepare("INSERT INTO pointages (id_creneau, heure_pointage_reelle, ip_source, token_utilise, statut) VALUES (?, NOW(), ?, ?, ?)");
    $stmt->execute([$creneau['id'], $_SERVER['REMOTE_ADDR'], $token_qr, $statut]);

    // Invalider le token (usage unique)
    $stmt = $pdo->prepare("UPDATE creneaux SET qr_token = NULL, qr_expire = NULL WHERE id = ?");
    $stmt->execute([$creneau['id']]);

    echo json_encode([
        'success' => true,
        'message' => 'Pointage enregistré avec succès',
        'statut' => $statut,
        'heure_pointage' => $heure_reelle,
        'creneau' => $creneau
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
?>