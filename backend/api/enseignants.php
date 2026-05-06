<?php
// ============================================
// EduSchedule Pro — API Enseignants
// ============================================

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';
$method = $_SERVER['REQUEST_METHOD'];

// GET /api/enseignants
if ($method === 'GET') {
    $userData = protegerRoute();
    $pdo = getConnexion();

    $specialite = $_GET['specialite'] ?? null;
    $statut = $_GET['statut'] ?? null;

    $sql = "SELECT * FROM enseignants WHERE 1=1";
    $params = [];

    if ($specialite) {
        $sql .= " AND specialite = ?";
        $params[] = $specialite;
    }
    if ($statut) {
        $sql .= " AND statut = ?";
        $params[] = $statut;
    }

    $sql .= " ORDER BY nom, prenom";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
    exit;
}

// POST /api/enseignants
if ($method === 'POST') {
    $userData = protegerRoute(['administrateur']);
    $data = json_decode(file_get_contents('php://input'), true);

    $matricule = $data['matricule'] ?? '';
    $nom = $data['nom'] ?? '';
    $prenom = $data['prenom'] ?? '';
    $email = $data['email'] ?? '';
    $specialite = $data['specialite'] ?? '';
    $statut = $data['statut'] ?? 'vacataire';
    $taux = $data['taux_horaire'] ?? 0;

    if (empty($nom) || empty($prenom) || empty($email)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Champs requis manquants']);
        exit;
    }

    $pdo = getConnexion();
    $stmt = $pdo->prepare("INSERT INTO enseignants 
        (matricule, nom, prenom, email, specialite, statut, taux_horaire) 
        VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$matricule, $nom, $prenom, $email, $specialite, $statut, $taux]);

    echo json_encode([
        'success' => true,
        'message' => 'Enseignant créé avec succès',
        'id' => $pdo->lastInsertId()
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
?>