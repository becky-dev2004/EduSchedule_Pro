<?php
// ============================================
// EduSchedule Pro — API Classes
// ============================================

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';
$method = $_SERVER['REQUEST_METHOD'];

// GET /api/classes — Liste toutes les classes
if ($method === 'GET') {
    $userData = protegerRoute();
    $pdo = getConnexion();
    $annee = $_GET['annee'] ?? null;

    if ($annee) {
        $stmt = $pdo->prepare("SELECT * FROM classes WHERE annee_academique = ? ORDER BY niveau");
        $stmt->execute([$annee]);
    } else {
        $stmt = $pdo->query("SELECT * FROM classes ORDER BY niveau");
    }

    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
    exit;
}

// POST /api/classes — Créer une classe (admin)
if ($method === 'POST') {
    $userData = protegerRoute(['administrateur']);
    $data = json_decode(file_get_contents('php://input'), true);

    $code = $data['code'] ?? '';
    $libelle = $data['libelle'] ?? '';
    $niveau = $data['niveau'] ?? '';
    $annee = $data['annee_academique'] ?? '2025-2026';

    if (empty($code) || empty($libelle) || empty($niveau)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Champs requis manquants']);
        exit;
    }

    $pdo = getConnexion();
    $stmt = $pdo->prepare("INSERT INTO classes (code, libelle, niveau, annee_academique) VALUES (?, ?, ?, ?)");
    $stmt->execute([$code, $libelle, $niveau, $annee]);

    echo json_encode([
        'success' => true,
        'message' => 'Classe créée avec succès',
        'id' => $pdo->lastInsertId()
    ]);
    exit;
}

// DELETE /api/classes/{id}
if ($method === 'DELETE') {
    $userData = protegerRoute(['administrateur']);
    $id = $_GET['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID requis']);
        exit;
    }

    $pdo = getConnexion();
    $stmt = $pdo->prepare("DELETE FROM classes WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(['success' => true, 'message' => 'Classe supprimée']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
?>