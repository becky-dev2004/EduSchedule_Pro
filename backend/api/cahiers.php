<?php
// ============================================
// EduSchedule Pro — API Cahier de texte
// ============================================

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// GET /api/cahiers
if ($method === 'GET' && !str_contains($uri, 'signer') && !str_contains($uri, 'cloture')) {
    $userData = protegerRoute();
    $pdo = getConnexion();

    $id_creneau = $_GET['id_creneau'] ?? null;
    $id_classe = $_GET['id_classe'] ?? null;
    $mois = $_GET['mois'] ?? null;

    $sql = "SELECT ct.*, 
                   cr.jour, cr.heure_debut, cr.heure_fin,
                   m.libelle as matiere_libelle,
                   e.nom as enseignant_nom, e.prenom as enseignant_prenom,
                   c.libelle as classe_libelle
            FROM cahiers_texte ct
            JOIN creneaux cr ON ct.id_creneau = cr.id
            JOIN matieres m ON cr.id_matiere = m.id
            JOIN enseignants e ON cr.id_enseignant = e.id
            JOIN emploi_temps et ON cr.id_emploi_temps = et.id
            JOIN classes c ON et.id_classe = c.id
            WHERE 1=1";
    $params = [];

    if ($id_creneau) { $sql .= " AND ct.id_creneau = ?"; $params[] = $id_creneau; }
    if ($id_classe) { $sql .= " AND et.id_classe = ?"; $params[] = $id_classe; }
    if ($mois) { $sql .= " AND MONTH(ct.date_creation) = ?"; $params[] = $mois; }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
    exit;
}

// POST /api/cahiers — Créer un cahier
if ($method === 'POST' && !str_contains($uri, 'signer') && !str_contains($uri, 'cloture')) {
    $userData = protegerRoute(['delegue']);
    $data = json_decode(file_get_contents('php://input'), true);

    $id_creneau = $data['id_creneau'] ?? null;
    $titre = $data['titre'] ?? '';
    $contenu = $data['contenu_json'] ?? [];
    $travaux = $data['travaux'] ?? [];

    if (!$id_creneau) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID créneau requis']);
        exit;
    }

    $pdo = getConnexion();

    // Créer le cahier
    $stmt = $pdo->prepare("INSERT INTO cahiers_texte (id_creneau, id_delegue, titre_cours, contenu_json) VALUES (?, ?, ?, ?)");
    $stmt->execute([$id_creneau, $userData['id'], $titre, json_encode($contenu)]);
    $id_cahier = $pdo->lastInsertId();

    // Ajouter les travaux
    foreach ($travaux as $travail) {
        $stmt2 = $pdo->prepare("INSERT INTO travaux_demandes (id_cahier, description, date_limite, type) VALUES (?, ?, ?, ?)");
        $stmt2->execute([$id_cahier, $travail['description'], $travail['date_limite'], $travail['type']]);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Cahier de texte créé',
        'id' => $id_cahier
    ]);
    exit;
}

// POST /api/cahiers/{id}/signer
if ($method === 'POST' && str_contains($uri, 'signer')) {
    $userData = protegerRoute(['delegue', 'enseignant']);
    $data = json_decode(file_get_contents('php://input'), true);
    $id_cahier = $_GET['id'] ?? null;

    $signature_base64 = $data['signature_base64'] ?? '';
    $type = $data['type'] ?? '';

    if (!$id_cahier || empty($signature_base64) || empty($type)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Données manquantes']);
        exit;
    }

    $pdo = getConnexion();

    // Enregistrer la signature
    $stmt = $pdo->prepare("INSERT INTO signatures (id_cahier, type_signataire, id_utilisateur, signature_base64) VALUES (?, ?, ?, ?)");
    $stmt->execute([$id_cahier, $type, $userData['id'], $signature_base64]);

    // Mettre à jour le statut
    $nouveau_statut = $type === 'delegue' ? 'signe_delegue' : 'cloture';
    $stmt = $pdo->prepare("UPDATE cahiers_texte SET statut = ? WHERE id = ?");
    $stmt->execute([$nouveau_statut, $id_cahier]);

    echo json_encode(['success' => true, 'message' => 'Signature enregistrée']);
    exit;
}

// POST /api/cahiers/{id}/cloture
if ($method === 'POST' && str_contains($uri, 'cloture')) {
    $userData = protegerRoute(['enseignant']);
    $data = json_decode(file_get_contents('php://input'), true);
    $id_cahier = $_GET['id'] ?? null;

    $heure_fin = $data['heure_fin'] ?? null;
    $signature = $data['signature_base64'] ?? '';

    if (!$id_cahier || !$heure_fin) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Données manquantes']);
        exit;
    }

    $pdo = getConnexion();
    $stmt = $pdo->prepare("UPDATE cahiers_texte SET heure_fin_reelle = ?, statut = 'cloture' WHERE id = ?");
    $stmt->execute([$heure_fin, $id_cahier]);

    if ($signature) {
        $stmt2 = $pdo->prepare("INSERT INTO signatures (id_cahier, type_signataire, id_utilisateur, signature_base64) VALUES (?, 'enseignant', ?, ?)");
        $stmt2->execute([$id_cahier, $userData['id'], $signature]);
    }

    echo json_encode(['success' => true, 'message' => 'Séance clôturée avec succès']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
?>