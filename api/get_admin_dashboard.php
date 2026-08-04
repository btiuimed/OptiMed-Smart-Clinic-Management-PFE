<?php
/**
 * api/get_admin_dashboard.php
 *
 * Retourne toutes les données nécessaires au dashboard administrateur :
 *   stats              : compteurs globaux
 *   recent_appointments: 5 derniers RDV pour le tableau récent
 *   activities         : fil d'activité (10 derniers RDV créés)
 *
 * Structure attendue par loadAdminDashboard() dans script.js :
 *   data.stats.total_appointments
 *   data.stats.pending_reviews
 *   data.stats.confirmed_appointments
 *   data.stats.total_patients
 *   data.recent_appointments[]: { patient_name, reason, appointment_date, status }
 *   data.activities[]:          { patient_name, activity_time }
 */

session_start();
header('Content-Type: application/json');

require 'db_connect.php';

/* ── Auth ──────────────────────────────────────────────────────── */
if (empty($_SESSION['ncUser'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Non authentifié.']);
    exit;
}

if ($_SESSION['ncUser']['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Accès réservé aux administrateurs.']);
    exit;
}

/* ── Helper : normalise le statut (gère les valeurs vides en BDD) ── */
// On s'appuie sur COALESCE+NULLIF directement en SQL pour ne pas
// re-mapper en PHP après coup.

/* ── 1. Compteurs globaux ────────────────────────────────────────── */
$statsRow = $conn->query(
    "SELECT
         COUNT(*)                                                          AS total_appointments,
         SUM(COALESCE(NULLIF(status,''),'pending') IN ('pending'))        AS pending_reviews,
         SUM(COALESCE(NULLIF(status,''),'pending') = 'confirmed')         AS confirmed_appointments
     FROM appointments"
)->fetch_assoc();

$patientCount = (int) $conn->query("SELECT COUNT(*) AS n FROM patients")->fetch_assoc()['n'];

$stats = [
    'total_appointments'     => (int) ($statsRow['total_appointments'] ?? 0),
    'pending_reviews'        => (int) ($statsRow['pending_reviews']    ?? 0),
    'confirmed_appointments' => (int) ($statsRow['confirmed_appointments'] ?? 0),
    'total_patients'         => $patientCount,
];

/* ── 2. Rendez-vous récents (tableau du dashboard) ─────────────── */
$recentResult = $conn->query(
    "SELECT
         CONCAT(pt.first_name, ' ', pt.last_name)           AS patient_name,
         COALESCE(a.reason, 'Consultation générale')        AS reason,
         a.appointment_date,
         COALESCE(NULLIF(a.status, ''), 'pending')          AS status
     FROM appointments a
     JOIN patients pt ON pt.id = a.patient_id
     ORDER BY a.appointment_date DESC, a.appointment_time DESC
     LIMIT 5"
);
$recentAppointments = $recentResult->fetch_all(MYSQLI_ASSOC);

/* ── 3. Fil d'activité (10 derniers RDV créés, avec heure relative) */
$activityResult = $conn->query(
    "SELECT
         CONCAT(pt.first_name, ' ', pt.last_name) AS patient_name,
         a.created_at                              AS activity_time
     FROM appointments a
     JOIN patients pt ON pt.id = a.patient_id
     ORDER BY a.created_at DESC
     LIMIT 10"
);
$activities = $activityResult->fetch_all(MYSQLI_ASSOC);

$conn->close();

echo json_encode([
    'success'             => true,
    'stats'               => $stats,
    'recent_appointments' => $recentAppointments,
    'activities'          => $activities,
]);
