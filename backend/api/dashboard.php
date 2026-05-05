<?php
// ============================================
// EduSchedule Pro — API Dashboard
// ============================================

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$userData = protegerRoute();
$pdo = getConnexion();

// Statistiques du jour
$aujourd_hui = date('Y-m-d');
$jour_semaine = date('l');

// Total séances aujourd'hui
$stmt = $pdo->prepare("
    SELECT COUNT(*) FROM creneaux cr
    JOIN emploi_temps et ON cr.id_emploi_temps = et.id
    WHERE et.statut_publication = 'publié'
    AND cr.jour = DAYNAME(?)
");
$stmt->execute([$aujourd_hui]);
$total_seances = $stmt->fetchColumn();

// Séances pointées
$stmt = $pdo->prepare("
    SELECT COUNT(*) FROM pointages p
    JOIN creneaux cr ON p.id_creneau = cr.id
    WHERE DATE(p.heure_pointage_reelle) = ?
");
$stmt->execute([$aujourd_hui]);
$seances_pointees = $stmt->fetchColumn();

// Retards
$stmt = $pdo->prepare("
    SELECT COUNT(*) FROM pointages 
    WHERE statut = 'retard' 
    AND DATE(heure_pointage_reelle) = ?
");
$stmt->execute([$aujourd_hui]);
$retards = $stmt->fetchColumn();

// Absences (séances non pointées)
$absences = $total_seances - $seances_pointees;

// Cahiers non signés
$stmt = $pdo->query("SELECT COUNT(*) FROM cahiers_texte WHERE statut != 'cloture'");
$cahiers_non_signes = $stmt->fetchColumn();

// Vacations en attente
$stmt = $pdo->query("SELECT COUNT(*) FROM vacations WHERE statut = 'generee'");
$vacations_attente = $stmt->fetchColumn();

echo json_encode([
    'success' => true,
    'data' => [
        'total_seances' => $total_seances,
        'seances_pointees' => $seances_pointees,
        'retards' => $retards,
        'absences' => max(0, $absences),
        'cahiers_non_signes' => $cahiers_non_signes,
        'vacations_attente' => $vacations_attente
    ]
]);
?>