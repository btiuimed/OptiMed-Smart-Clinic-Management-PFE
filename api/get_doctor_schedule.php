<?php
/**
 * api/get_doctor_schedule.php
 *
 * Retourne le planning de la semaine (7 jours) pour le médecin connecté.
 * Paramètre GET optionnel : week_start=YYYY-MM-DD (lundi de la semaine)
 *
 * Structure attendue par renderWeekCalendar() dans script.js :
 *   data.week_start   : 'YYYY-MM-DD'
 *   data.week_end     : 'YYYY-MM-DD'
 *   data.appointments : [{ date, time, patient_name, reason, status }, …]
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

$user = $_SESSION['ncUser'];
if ($user['role'] !== 'doctor') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Accès réservé aux médecins.']);
    exit;
}

$userId = (int) $user['id'];

/* ── Profil médecin ─────────────────────────────────────────────── */
$stmt = $conn->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
$stmt->bind_param('i', $userId);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$row) {
    echo json_encode(['success' => true, 'week_start' => date('Y-m-d'), 'week_end' => date('Y-m-d', strtotime('+6 days')), 'appointments' => []]);
    $conn->close();
    exit;
}

$doctorId = (int) $row['id'];

/* ── Calcul de la semaine demandée ──────────────────────────────── */
$requestedStart = $_GET['week_start'] ?? null;

if ($requestedStart && preg_match('/^\d{4}-\d{2}-\d{2}$/', $requestedStart)) {
    $weekStart = new DateTime($requestedStart);
} else {
    // Par défaut : lundi de la semaine courante
    $weekStart = new DateTime();
    $dow = (int) $weekStart->format('N'); // 1=lundi … 7=dimanche
    if ($dow > 1) $weekStart->modify('-' . ($dow - 1) . ' days');
}

$weekEnd = clone $weekStart;
$weekEnd->modify('+6 days');

$startStr = $weekStart->format('Y-m-d');
$endStr   = $weekEnd->format('Y-m-d');

/* ── Récupération des RDV de la semaine ────────────────────────── */
$stmt = $conn->prepare(
    "SELECT
         a.appointment_date                                  AS date,
         TIME_FORMAT(a.appointment_time, '%H:%i')           AS time,
         COALESCE(NULLIF(a.status, ''), 'pending')          AS status,
         COALESCE(a.reason, 'Consultation générale')        AS reason,
         CONCAT(pt.first_name, ' ', pt.last_name)           AS patient_name
     FROM appointments a
     JOIN patients pt ON pt.id = a.patient_id
     WHERE a.doctor_id = ?
       AND a.appointment_date BETWEEN ? AND ?
     ORDER BY a.appointment_date ASC, a.appointment_time ASC"
);
$stmt->bind_param('iss', $doctorId, $startStr, $endStr);
$stmt->execute();
$appointments = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();
$conn->close();

echo json_encode([
    'success'      => true,
    'week_start'   => $startStr,
    'week_end'     => $endStr,
    'appointments' => $appointments,
]);
