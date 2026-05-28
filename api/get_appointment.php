<?php
session_start();
header('Content-Type: application/json');

require 'db_connect.php';

if (empty($_SESSION['ncUser'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
    exit;
}

$sessionUser = $_SESSION['ncUser'];
$userId      = (int)$sessionUser['id'];
$role        = $sessionUser['role'];

if ($role === 'patient') {
    // Return only this patient's appointments
    $stmt = $conn->prepare(
        "SELECT
            a.id, a.appointment_date AS date, a.appointment_time AS time,
            a.status, a.reason AS notes,
            CONCAT(d.first_name, ' ', d.last_name) AS doctor,
            dept.name AS service
         FROM appointments a
         JOIN patients  p    ON p.id    = a.patient_id
         JOIN doctors   d    ON d.id    = a.doctor_id
         LEFT JOIN departments dept ON dept.id = d.department_id
         WHERE p.user_id = ?
         ORDER BY a.appointment_date DESC, a.appointment_time DESC"
    );
    $stmt->bind_param('i', $userId);

} elseif ($role === 'admin') {
    // Return all appointments with patient details
    $stmt = $conn->prepare(
        "SELECT
            a.id, a.appointment_date AS date, a.appointment_time AS time,
            a.status, a.reason AS notes,
            CONCAT(d.first_name,  ' ', d.last_name)  AS doctor,
            CONCAT(pt.first_name, ' ', pt.last_name) AS patient,
            u.email,
            dept.name AS service
         FROM appointments a
         JOIN patients  pt   ON pt.id   = a.patient_id
         JOIN users     u    ON u.id    = pt.user_id
         JOIN doctors   d    ON d.id    = a.doctor_id
         LEFT JOIN departments dept ON dept.id = d.department_id
         ORDER BY a.appointment_date DESC, a.appointment_time DESC"
    );

} else {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden.']);
    exit;
}

$stmt->execute();
$rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();
$conn->close();

echo json_encode(['success' => true, 'appointments' => $rows]);
