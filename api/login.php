<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // tighten in production
header('Access-Control-Allow-Methods: POST');

require 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$data  = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
$pwd   = $data['password'] ?? '';

if (!$email || !$pwd) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
    exit;
}

// Fetch user by email
$stmt = $conn->prepare(
    "SELECT u.id, u.email, u.password, u.role,
            COALESCE(p.first_name, d.first_name) AS first_name,
            COALESCE(p.last_name,  d.last_name)  AS last_name,
            COALESCE(p.phone,      d.phone)       AS phone
     FROM users u
     LEFT JOIN patients p ON p.user_id = u.id
     LEFT JOIN doctors  d ON d.user_id = u.id
     WHERE u.email = ?
     LIMIT 1"
);
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$user   = $result->fetch_assoc();
$stmt->close();

if (!$user || !password_verify($pwd, $user['password'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
    exit;
}

// Build safe session payload (never expose the hash)
$payload = [
    'id'         => (int)$user['id'],
    'email'      => $user['email'],
    'role'       => $user['role'],
    'firstName'  => $user['first_name'] ?? '',
    'lastName'   => $user['last_name']  ?? '',
    'phone'      => $user['phone']      ?? '',
    'initials'   => strtoupper(
                        substr($user['first_name'] ?? '', 0, 1) .
                        substr($user['last_name']  ?? '', 0, 1)
                    ),
];

$_SESSION['ncUser'] = $payload;

echo json_encode(['success' => true, 'user' => $payload]);
$conn->close();
