<?php
// ============================================
// EduSchedule Pro — Middleware JWT
// ============================================

require_once __DIR__ . '/../config/config.php';

/**
 * Génère un token JWT
 */
function genererToken($payload) {
    $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload['exp'] = time() + JWT_EXPIRATION;
    $payload = base64_encode(json_encode($payload));
    $signature = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    return "$header.$payload.$signature";
}

/**
 * Vérifie et décode un token JWT
 */
function verifierToken($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;

    [$header, $payload, $signature] = $parts;
    $signatureValide = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));

    if ($signature !== $signatureValide) return null;

    $data = json_decode(base64_decode($payload), true);

    if ($data['exp'] < time()) return null;

    return $data;
}

/**
 * Protège une route : vérifie le token JWT
 */
function protegerRoute($rolesAutorises = []) {
    $headers = getallheaders();
    $authorization = $headers['Authorization'] ?? '';

    if (!str_starts_with($authorization, 'Bearer ')) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Token manquant']);
        exit;
    }

    $token = substr($authorization, 7);
    $data = verifierToken($token);

    if (!$data) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Token invalide ou expiré']);
        exit;
    }

    if (!empty($rolesAutorises) && !in_array($data['role'], $rolesAutorises)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Accès refusé']);
        exit;
    }

    return $data;
}
?>