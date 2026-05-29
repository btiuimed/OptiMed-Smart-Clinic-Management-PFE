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

// Resolve doctor id + department
$stmtDoc = $conn->prepare(
    "SELECT id, department_id FROM doctors WHERE user_id = ? LIMIT 1"
);
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

// Fetch every distinct patient who has at least one appointment with this doctor.
// Also pulls their latest appointment date + total visit count with this doctor.
$stmt = $conn->prepare(
    "SELECT
        p.id                                        AS patient_id,
        CONCAT(p.first_name, ' ', p.last_name)      AS full_name,
        p.phone,
        p.dob,
        u.email,
        COUNT(a.id)                                 AS total_visits,
        MAX(a.appointment_date)                     AS last_visit,
        -- Most recent appointment status with this doctor
        SUBSTRING_INDEX(
            GROUP_CONCAT(a.status ORDER BY a.appointment_date DESC),
            ',', 1
        )                                           AS last_status
     FROM appointments a
     JOIN patients  p ON p.id    = a.patient_id
     JOIN users     u ON u.id    = p.user_id
     WHERE a.doctor_id = ?
     GROUP BY p.id, p.first_name, p.last_name, p.phone, p.dob, u.email
     ORDER BY last_visit DESC"
);
$stmt->bind_param('i', $doctorId);
$stmt->execute();
$patients = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

// For each patient also fetch their appointment history with this doctor
// (used for the expandable detail row)
$history = [];
if (!empty($patients)) {
    $stmtH = $conn->prepare(
        "SELECT
            a.id,
            a.appointment_date  AS date,
            a.appointment_time  AS time,
            a.status,
            a.reason,
            p.id                AS patient_id
         FROM appointments a
         JOIN patients p ON p.id = a.patient_id
         WHERE a.doctor_id = ?
         ORDER BY a.appointment_date DESC, a.appointment_time DESC"
    );
    $stmtH->bind_param('i', $doctorId);
    $stmtH->execute();
    $rows = $stmtH->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmtH->close();

    foreach ($rows as $row) {
        $history[$row['patient_id']][] = $row;
    }
}

$conn->close();

echo json_encode([
    'success'  => true,
    'patients' => $patients,
    'history'  => $history,   // keyed by patient_id
]);
