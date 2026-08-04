<?php
session_start();
header('Content-Type: application/json');
require 'db_connect.php';

if (empty($_SESSION['ncUser']) || $_SESSION['ncUser']['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Accès refusé.']);
    exit;
}

$result = $conn->query(
    "SELECT u.id, u.email, u.role, u.created_at,
            COALESCE(CONCAT(p.first_name,' ',p.last_name),
                     CONCAT(d.first_name,' ',d.last_name)) AS full_name
     FROM users u
     LEFT JOIN patients p ON p.user_id = u.id
     LEFT JOIN doctors  d ON d.user_id = u.id
     ORDER BY u.created_at DESC"
);
echo json_encode(['success' => true, 'users' => $result->fetch_all(MYSQLI_ASSOC)]);
