<?php
// ============================================
// EduSchedule Pro — API Emploi du temps
// ============================================

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// GET /api/emploi-temps
if ($method === 'GET' && !str_contains($uri, 'publier')) {
    $userData = protegerRoute();
    $pdo = getConnexion();

    $id_classe = $_GET['id_classe'] ?? null;
    $semaine = $_GET['semaine'] ?? null;

    $sql = "SELECT et.*, c.libelle as classe_libelle 
            FROM emploi_temps et 
            JOIN classes c ON et.id_classe = c.id 
            WHERE 1=1";
    $params = [];

    if ($id_classe) {
        $sql .= " AND et.id_classe = ?";
        $params[] = $id_classe;
    }
    if ($semaine) {
        $sql .= " AND et.semaine_debut = ?";
        $params[] = $semaine;
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $emplois = $stmt->fetchAll();

    // Récupérer les créneaux pour chaque emploi du temps
    foreach ($emplois as &$emploi) {
        $stmt2 = $pdo->prepare("
            SELECT cr.*, 
                   m.libelle as matiere_libelle,
                   e.nom as enseignant_nom, e.prenom as enseignant_prenom,
                   s.code as salle_code
            FROM creneaux cr
            JOIN matieres m ON cr.id_matiere = m.id
            JOIN enseignants e ON cr.id_enseignant = e.id
            JOIN salles s ON cr.id_salle = s.id
            WHERE cr.id_emploi_temps = ?
            ORDER BY FIELD(cr.jour,'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'), cr.heure_debut
        ");
        $stmt2->execute([$emploi['id']]);
        $emploi['creneaux'] = $stmt2->fetchAll();
    }

    echo json_encode(['success' => true, 'data' => $emplois]);
    exit;
}

// POST /api/emploi-temps
if ($method === 'POST') {
    $userData = protegerRoute(['administrateur']);
    $data = json_decode(file_get_contents('php://input'), true);

    $id_classe = $data['id_classe'] ?? null;
    $semaine_debut = $data['semaine_debut'] ?? null;
    $creneaux = $data['creneaux'] ?? [];

    if (!$id_classe || !$semaine_debut) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Classe et semaine requises']);
        exit;
    }

    $pdo = getConnexion();

    // Créer l'emploi du temps
    $stmt = $pdo->prepare("INSERT INTO emploi_temps (id_classe, semaine_debut, cree_par) VALUES (?, ?, ?)");
    $stmt->execute([$id_classe, $semaine_debut, $userData['id']]);
    $id_emploi = $pdo->lastInsertId();

    // Créer les créneaux
    foreach ($creneaux as $creneau) {
        // Vérifier les conflits
        $stmt_conflit = $pdo->prepare("
            SELECT COUNT(*) FROM creneaux cr
            JOIN emploi_temps et ON cr.id_emploi_temps = et.id
            WHERE et.semaine_debut = ?
            AND cr.jour = ?
            AND cr.id_enseignant = ?
            AND (
                (cr.heure_debut <= ? AND cr.heure_fin > ?) OR
                (cr.heure_debut < ? AND cr.heure_fin >= ?)
            )
        ");
        $stmt_conflit->execute([
            $semaine_debut,
            $creneau['jour'],
            $creneau['id_enseignant'],
            $creneau['heure_debut'], $creneau['heure_debut'],
            $creneau['heure_fin'], $creneau['heure_fin']
        ]);

        if ($stmt_conflit->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'message' => 'Conflit détecté : enseignant déjà occupé sur ce créneau'
            ]);
            exit;
        }

        $stmt2 = $pdo->prepare("INSERT INTO creneaux 
            (id_emploi_temps, id_matiere, id_enseignant, id_salle, jour, heure_debut, heure_fin) 
            VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt2->execute([
            $id_emploi,
            $creneau['id_matiere'],
            $creneau['id_enseignant'],
            $creneau['id_salle'],
            $creneau['jour'],
            $creneau['heure_debut'],
            $creneau['heure_fin']
        ]);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Emploi du temps créé avec succès',
        'id' => $id_emploi
    ]);
    exit;
}

// PUT /api/emploi-temps/{id}/publier
if ($method === 'PUT' && str_contains($uri, 'publier')) {
    $userData = protegerRoute(['administrateur']);
    $id = $_GET['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID requis']);
        exit;
    }

    $pdo = getConnexion();
    $stmt = $pdo->prepare("UPDATE emploi_temps SET statut_publication = 'publié' WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(['success' => true, 'message' => 'Emploi du temps publié']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
?>