<?php
session_start();
header('Content-Type: application/json');

require 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$data      = json_decode(file_get_contents('php://input'), true);
$firstName = trim($data['firstName'] ?? '');
$lastName  = trim($data['lastName']  ?? '');
$email     = trim($data['email']     ?? '');
$pwd       = $data['password']       ?? '';
$phone     = trim($data['phone']     ?? '');
$dob       = $data['dob']            ?? null;

if (!$firstName || !$email || !$pwd) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Required fields missing.']);
    exit;
}

// Check for duplicate email
$chk = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
$chk->bind_param('s', $email);
$chk->execute();
$chk->store_result();
if ($chk->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Email already registered.']);
    $chk->close();
    exit;
}
$chk->close();

$hash = password_hash($pwd, PASSWORD_BCRYPT);

// Insert into users
$stmtU = $conn->prepare(
    "INSERT INTO users (email, password, role) VALUES (?, ?, 'patient')"
);
$stmtU->bind_param('ss', $email, $hash);
$stmtU->execute();
$userId = $conn->insert_id;
$stmtU->close();

// Insert into patients
$stmtP = $conn->prepare(
    "INSERT INTO patients (user_id, first_name, last_name, phone, dob)
     VALUES (?, ?, ?, ?, ?)"
);
$stmtP->bind_param('issss', $userId, $firstName, $lastName, $phone, $dob);
$stmtP->execute();
$stmtP->close();

$payload = [
    'id'        => $userId,
    'email'     => $email,
    'role'      => 'patient',
    'firstName' => $firstName,
    'lastName'  => $lastName,
    'phone'     => $phone,
    'initials'  => strtoupper(substr($firstName, 0, 1) . substr($lastName, 0, 1)),
];

$_SESSION['ncUser'] = $payload;

echo json_encode(['success' => true, 'user' => $payload]);
$conn->close();
