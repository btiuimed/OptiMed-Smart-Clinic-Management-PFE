<?php
/**
 * api/get_doctor_stats.php
 *
 * Retourne pour le médecin connecté :
 *   stats      : { total_today, pending, completed, next_apt }
 *   today_list : tableau des RDV d'aujourd'hui triés par heure
 */

session_start();
header('Content-Type: application/json');
require 'db_connect.php';

/* ── Auth ── */
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
$today  = date('Y-m-d');

/* ── ID interne du médecin ── */
$stmt = $conn->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
$stmt->bind_param('i', $userId);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$row) {
    echo json_encode([
        'success'    => true,
        'stats'      => ['total_today' => 0, 'pending' => 0, 'completed' => 0, 'next_apt' => null],
        'today_list' => [],
    ]);
    $conn->close();
    exit;
}

$doctorId = (int) $row['id'];

/* ── RDV du jour ── */
$stmt = $conn->prepare(
    "SELECT
         a.id,
         TIME_FORMAT(a.appointment_time, '%H:%i')           AS time,
         COALESCE(NULLIF(a.status, ''), 'pending')          AS status,
         COALESCE(a.reason, 'Consultation générale')        AS reason,
         CONCAT(pt.first_name, ' ', pt.last_name)           AS patient_name
     FROM appointments a
     JOIN patients pt ON pt.id = a.patient_id
     WHERE a.doctor_id = ?
       AND a.appointment_date = ?
     ORDER BY a.appointment_time ASC"
);
$stmt->bind_param('is', $doctorId, $today);
$stmt->execute();
$todayRows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

/* ── Calcul des stats ── */
$total_today = count($todayRows);
$pending = $completed = 0;

foreach ($todayRows as $r) {
    if ($r['status'] === 'completed')                      $completed++;
    if (in_array($r['status'], ['pending', 'confirmed']))  $pending++;
}

/* ── Prochain RDV ── */
$next_apt = null;
foreach ($todayRows as $r) {
    if (in_array($r['status'], ['pending', 'confirmed'])) {
        $next_apt = [
            'appointment_time' => $r['time'],
            'patient_name'     => $r['patient_name'],
        ];
        break;
    }
}

$conn->close();

echo json_encode([
    'success' => true,
    'stats'   => [
        'total_today' => $total_today,
        'pending'     => $pending,
        'completed'   => $completed,
        'next_apt'    => $next_apt,
    ],
    'today_list' => $todayRows,
]);
