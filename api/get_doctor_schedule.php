<?php
session_start();
header('Content-Type: application/json');
require 'db_connect.php';

if (empty($_SESSION['ncUser']) || $_SESSION['ncUser']['role'] !== 'doctor') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Doctor access required.']);
    exit;
}

$userId = (int)$_SESSION['ncUser']['id'];

// Resolve doctor id
$stmtDoc = $conn->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
$stmtDoc->bind_param('i', $userId);
$stmtDoc->execute();
$doctor = $stmtDoc->get_result()->fetch_assoc();
$stmtDoc->close();

if (!$doctor) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Doctor profile not found.']);
    exit;
}

$doctorId = (int)$doctor['id'];

// Accept a ?week_start=YYYY-MM-DD param, default to current Monday
$weekStart = $_GET['week_start'] ?? null;
if (!$weekStart || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $weekStart)) {
    // Calculate this Monday
    $dayOfWeek = (int)date('N'); // 1=Mon … 7=Sun
    $weekStart = date('Y-m-d', strtotime('-' . ($dayOfWeek - 1) . ' days'));
}
$weekEnd = date('Y-m-d', strtotime($weekStart . ' +6 days'));

$stmt = $conn->prepare(
    "SELECT
        a.id,
        a.appointment_date AS date,
        a.appointment_time AS time,
        a.status,
        a.reason,
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        p.phone AS patient_phone
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     WHERE a.doctor_id = ?
       AND a.appointment_date BETWEEN ? AND ?
     ORDER BY a.appointment_date ASC, a.appointment_time ASC"
);
$stmt->bind_param('iss', $doctorId, $weekStart, $weekEnd);
$stmt->execute();
$appointments = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();
$conn->close();

echo json_encode([
    'success'      => true,
    'week_start'   => $weekStart,
    'week_end'     => $weekEnd,
    'appointments' => $appointments,
]);
