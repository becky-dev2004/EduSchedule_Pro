<?php
// ============================================
// EduSchedule Pro — Configuration générale
// ============================================

// URL de base de l'application
define('BASE_URL', 'http://localhost/EduSchedule-Pro');

// Clé secrète pour JWT et QR-Code
define('JWT_SECRET', 'eduschedulepro_secret_key_2025');
define('QR_SECRET', 'eduschedulepro_qr_secret_2025');

// Durée de validité du token JWT (en secondes)
define('JWT_EXPIRATION', 3600); // 1 heure

// Fenêtre de validité QR-Code (en minutes)
define('QR_FENETRE_MINUTES', 15);

// Retard maximum avant alerte (en minutes)
define('RETARD_ALERTE_MINUTES', 30);

// Configuration CORS
define('ALLOWED_ORIGIN', 'http://localhost:3000');
?>