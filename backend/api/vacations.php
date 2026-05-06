<?php
// ============================================
// EduSchedule Pro — API Vacations
// ============================================

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// GET /api/vacations
if ($method === 'GET' && !str_contains($uri, 'pdf')) {
    $userData = protegerRoute();
    $pdo = getConnexion();

    $id_enseignant = $_GET['id_enseignant'] ?? null;
    $mois = $_GET['mois'] ?? null;
    $annee = $_GET['annee'] ?? null;

    $sql = "SELECT v.*, e.nom, e.prenom, e.matricule 
            FROM vacations v 
            JOIN enseignants e ON v.id_enseignant = e.id 
            WHERE 1=1";
    $params = [];

    if ($id_enseignant) { $sql .= " AND v.id_enseignant = ?"; $params[] = $id_enseignant; }
    if ($mois) { $sql .= " AND v.mois = ?"; $params[] = $mois; }
    if ($annee) { $sql .= " AND v.annee = ?"; $params[] = $annee; }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
    exit;
}

// POST /api/vacations/generer
if ($method === 'POST' && str_contains($uri, 'generer')) {
    $userData = protegerRoute(['administrateur', 'surveillant']);
    $data = json_decode(file_get_contents('php://input'), true);

    $id_enseignant = $data['id_enseignant'] ?? null;
    $mois = $data['mois'] ?? null;
    $annee = $data['annee'] ?? null;

    if (!$id_enseignant || !$mois || !$annee) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Données manquantes']);
        exit;
    }

    $pdo = getConnexion();

    // Récupérer les séances clôturées du mois
    $stmt = $pdo->prepare("
        SELECT cr.id, cr.heure_debut, cr.heure_fin,
               ct.heure_fin_reelle, ct.id as id_cahier,
               e.taux_horaire
        FROM creneaux cr
        JOIN cahiers_texte ct ON ct.id_creneau = cr.id
        JOIN emploi_temps et ON cr.id_emploi_temps = et.id
        JOIN enseignants e ON cr.id_enseignant = e.id
        WHERE cr.id_enseignant = ?
        AND MONTH(ct.date_creation) = ?
        AND YEAR(ct.date_creation) = ?
        AND ct.statut = 'cloture'
    ");
    $stmt->execute([$id_enseignant, $mois, $annee]);
    $seances = $stmt->fetchAll();

    if (empty($seances)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Aucune séance clôturée trouvée']);
        exit;
    }

    // Calculer le montant total
    $montant_brut = 0;
    $lignes = [];

    foreach ($seances as $seance) {
        $debut = strtotime($seance['heure_debut']);
        $fin = strtotime($seance['heure_fin_reelle'] ?? $seance['heure_fin']);
        $duree_heures = ($fin - $debut) / 3600;
        $montant = $duree_heures * $seance['taux_horaire'];
        $montant_brut += $montant;

        $lignes[] = [
            'id_creneau' => $seance['id'],
            'duree_heures' => round($duree_heures, 2),
            'taux' => $seance['taux_horaire'],
            'montant' => round($montant, 2)
        ];
    }

    // Créer la fiche de vacation
    $stmt = $pdo->prepare("INSERT INTO vacations (id_enseignant, mois, annee, montant_brut, montant_net) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$id_enseignant, $mois, $annee, round($montant_brut, 2), round($montant_brut, 2)]);
    $id_vacation = $pdo->lastInsertId();

    // Créer les lignes de détail
    foreach ($lignes as $ligne) {
        $stmt2 = $pdo->prepare("INSERT INTO vacation_lignes (id_vacation, id_creneau, duree_heures, taux, montant) VALUES (?, ?, ?, ?, ?)");
        $stmt2->execute([$id_vacation, $ligne['id_creneau'], $ligne['duree_heures'], $ligne['taux'], $ligne['montant']]);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Fiche de vacation générée',
        'id' => $id_vacation,
        'montant_brut' => round($montant_brut, 2)
    ]);
    exit;
}

// POST /api/vacations/{id}/valider
if ($method === 'POST' && str_contains($uri, 'valider')) {
    $userData = protegerRoute(['surveillant']);
    $data = json_decode(file_get_contents('php://input'), true);
    $id_vacation = $_GET['id'] ?? null;

    $pdo = getConnexion();
    $stmt = $pdo->prepare("INSERT INTO validations (id_vacation, id_validateur, role_validateur, visa_base64, commentaire) VALUES (?, ?, 'surveillant', ?, ?)");
    $stmt->execute([$id_vacation, $userData['id'], $data['visa_base64'] ?? null, $data['commentaire'] ?? null]);

    $stmt2 = $pdo->prepare("UPDATE vacations SET statut = 'visee_surveillant' WHERE id = ?");
    $stmt2->execute([$id_vacation]);

    echo json_encode(['success' => true, 'message' => 'Vacation visée par le surveillant']);
    exit;
}

// POST /api/vacations/{id}/approuver
if ($method === 'POST' && str_contains($uri, 'approuver')) {
    $userData = protegerRoute(['comptable']);
    $data = json_decode(file_get_contents('php://input'), true);
    $id_vacation = $_GET['id'] ?? null;

    $pdo = getConnexion();
    $stmt = $pdo->prepare("INSERT INTO validations (id_vacation, id_validateur, role_validateur, commentaire) VALUES (?, ?, 'comptable', ?)");
    $stmt->execute([$id_vacation, $userData['id'], $data['commentaire'] ?? null]);

    $stmt2 = $pdo->prepare("UPDATE vacations SET statut = 'approuvee_comptable' WHERE id = ?");
    $stmt2->execute([$id_vacation]);

    echo json_encode(['success' => true, 'message' => 'Vacation approuvée par le comptable']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
?>