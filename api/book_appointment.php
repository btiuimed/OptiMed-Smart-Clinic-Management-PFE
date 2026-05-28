<?php
session_start();
header('Content-Type: application/json');

require 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

if (empty($_SESSION['ncUser'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
    exit;
}

$data      = json_decode(file_get_contents('php://input'), true);
$doctorId  = (int)($data['doctor_id']  ?? 0);
$aptDate   = $data['date']             ?? '';
$aptTime   = $data['time']             ?? '';
$reason    = trim($data['notes']       ?? '');
$userId    = (int)$_SESSION['ncUser']['id'];

if (!$doctorId || !$aptDate || !$aptTime) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'doctor_id, date and time are required.']);
    exit;
}

// Resolve patient_id from the session user_id
$stmtPat = $conn->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
$stmtPat->bind_param('i', $userId);
$stmtPat->execute();
$patRow = $stmtPat->get_result()->fetch_assoc();
$stmtPat->close();

if (!$patRow) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Patient profile not found.']);
    exit;
}
$patientId = (int)$patRow['id'];

// Prevent duplicate booking for the same slot
$dupCheck = $conn->prepare(
    "SELECT id FROM appointments
     WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ?
       AND status NOT IN ('cancelled')
     LIMIT 1"
);
$dupCheck->bind_param('iss', $doctorId, $aptDate, $aptTime);
$dupCheck->execute();
$dupCheck->store_result();
if ($dupCheck->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'This slot is already booked.']);
    $dupCheck->close();
    exit;
}
$dupCheck->close();

$stmt = $conn->prepare(
    "INSERT INTO appointments
        (patient_id, doctor_id, appointment_date, appointment_time, status, reason)
     VALUES (?, ?, ?, ?, 'pending', ?)"
);
$stmt->bind_param('iisss', $patientId, $doctorId, $aptDate, $aptTime, $reason);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'appointment_id' => $conn->insert_id]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to book appointment.']);
}

$stmt->close();
$conn->close();<?php
session_start();
header('Content-Type: application/json');

require 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

if (empty($_SESSION['ncUser'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
    exit;
}

$data      = json_decode(file_get_contents('php://input'), true);
$doctorId  = (int)($data['doctor_id']  ?? 0);
$aptDate   = $data['date']             ?? '';
$aptTime   = $data['time']             ?? '';
$reason    = trim($data['notes']       ?? '');
$userId    = (int)$_SESSION['ncUser']['id'];

if (!$doctorId || !$aptDate || !$aptTime) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'doctor_id, date and time are required.']);
    exit;
}

// Resolve patient_id from the session user_id
$stmtPat = $conn->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
$stmtPat->bind_param('i', $userId);
$stmtPat->execute();
$patRow = $stmtPat->get_result()->fetch_assoc();
$stmtPat->close();

if (!$patRow) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Patient profile not found.']);
    exit;
}
$patientId = (int)$patRow['id'];

// Prevent duplicate booking for the same slot
$dupCheck = $conn->prepare(
    "SELECT id FROM appointments
     WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ?
       AND status NOT IN ('cancelled')
     LIMIT 1"
);
$dupCheck->bind_param('iss', $doctorId, $aptDate, $aptTime);
$dupCheck->execute();
$dupCheck->store_result();
if ($dupCheck->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'This slot is already booked.']);
    $dupCheck->close();
    exit;
}
$dupCheck->close();

$stmt = $conn->prepare(
    "INSERT INTO appointments
        (patient_id, doctor_id, appointment_date, appointment_time, status, reason)
     VALUES (?, ?, ?, ?, 'pending', ?)"
);
$stmt->bind_param('iisss', $patientId, $doctorId, $aptDate, $aptTime, $reason);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'appointment_id' => $conn->insert_id]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to book appointment.']);
}

$stmt->close();
$conn->close();
