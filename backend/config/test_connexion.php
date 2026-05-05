<?php
// ============================================
// EduSchedule Pro — Test de connexion BDD
// ============================================

require_once 'database.php';

try {
    $pdo = getConnexion();
    
    // Test : récupérer les classes
    $stmt = $pdo->query("SELECT * FROM classes");
    $classes = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'message' => 'Connexion réussie !',
        'classes' => $classes
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>