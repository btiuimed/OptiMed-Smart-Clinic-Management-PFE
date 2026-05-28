<?php
session_start();
header('Content-Type: application/json');

require 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// Admin-only guard
if (empty($_SESSION['ncUser']) || $_SESSION['ncUser']['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Admin access required.']);
    exit;
}

$data         = json_decode(file_get_contents('php://input'), true);
$firstName    = trim($data['first_name']    ?? '');
$lastName     = trim($data['last_name']     ?? '');
$email        = trim($data['email']         ?? '');
$pwd          = $data['password']           ?? '';
$phone        = trim($data['phone']         ?? '');
$departmentId = !empty($data['department_id']) ? (int)$data['department_id'] : null;

if (!$firstName || !$lastName || !$email || !$pwd) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'first_name, last_name, email and password are required.']);
    exit;
}

// Duplicate email check
$chk = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
$chk->bind_param('s', $email);
$chk->execute();
$chk->store_result();
if ($chk->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Email already in use.']);
    $chk->close();
    exit;
}
$chk->close();

$hash = password_hash($pwd, PASSWORD_BCRYPT);

// Create the user account with role = doctor
$stmtU = $conn->prepare("INSERT INTO users (email, password, role) VALUES (?, ?, 'doctor')");
$stmtU->bind_param('ss', $email, $hash);
$stmtU->execute();
$userId = $conn->insert_id;
$stmtU->close();

// Create the doctor profile
$stmtD = $conn->prepare(
    "INSERT INTO doctors (user_id, department_id, first_name, last_name, phone)
     VALUES (?, ?, ?, ?, ?)"
);
$stmtD->bind_param('iisss', $userId, $departmentId, $firstName, $lastName, $phone);

if ($stmtD->execute()) {
    echo json_encode(['success' => true, 'doctor_id' => $conn->insert_id]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to create doctor profile.']);
}

$stmtD->close();
$conn->close();
