<?php
// ============================================
// EduSchedule Pro — API Authentification
// ============================================

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// POST /api/auth/login
if ($method === 'POST' && str_contains($uri, 'login')) {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email et mot de passe requis']);
        exit;
    }

    $pdo = getConnexion();
    $stmt = $pdo->prepare("SELECT * FROM utilisateurs WHERE email = ? AND actif = 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['mot_de_passe_hash'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Email ou mot de passe incorrect']);
        exit;
    }

    // Générer le token JWT
    $token = genererToken([
        'id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'id_lien' => $user['id_lien']
    ]);

    // Log de connexion
    $stmt = $pdo->prepare("INSERT INTO logs_activite (id_utilisateur, action, ip) VALUES (?, 'connexion', ?)");
    $stmt->execute([$user['id'], $_SERVER['REMOTE_ADDR']]);

    echo json_encode([
        'success' => true,
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'id_lien' => $user['id_lien']
        ]
    ]);
    exit;
}

// POST /api/auth/logout
if ($method === 'POST' && str_contains($uri, 'logout')) {
    $userData = protegerRoute();
    $pdo = getConnexion();
    $stmt = $pdo->prepare("INSERT INTO logs_activite (id_utilisateur, action, ip) VALUES (?, 'deconnexion', ?)");
    $stmt->execute([$userData['id'], $_SERVER['REMOTE_ADDR']]);
    echo json_encode(['success' => true, 'message' => 'Déconnexion réussie']);
    exit;
}

http_response_code(404);
echo json_encode(['success' => false, 'message' => 'Route non trouvée']);
?>