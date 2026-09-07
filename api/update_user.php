<?php
session_start();
header('Content-Type: application/json');
require 'db_connect.php';

if (empty($_SESSION['ncUser']) || $_SESSION['ncUser']['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Accès refusé.']);
    exit;
}

$body     = json_decode(file_get_contents('php://input'), true);
$id       = (int)   ($body['id']        ?? 0);
$email    = trim(    $body['email']      ?? '');
$role     = trim(    $body['role']       ?? 'patient');
$fullName = trim(    $body['full_name']  ?? '');
$password = trim(    $body['password']   ?? '');

if (!$id || !$email) {
    echo json_encode(['success' => false, 'message' => 'Paramètres invalides.']);
    exit;
}

$allowed = ['patient', 'doctor', 'admin'];
if (!in_array($role, $allowed)) {
    echo json_encode(['success' => false, 'message' => 'Rôle invalide.']);
    exit;
}

/* ── Mise à jour email + rôle ── */
if ($password) {
    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $conn->prepare(
        "UPDATE users SET email = ?, role = ?, password = ? WHERE id = ?"
    );
    $stmt->bind_param('sssi', $email, $role, $hash, $id);
} else {
    $stmt = $conn->prepare(
        "UPDATE users SET email = ?, role = ? WHERE id = ?"
    );
    $stmt->bind_param('ssi', $email, $role, $id);
}
$ok = $stmt->execute();
$stmt->close();

/* ── Mise à jour nom dans patients ou doctors ── */
if ($ok && $fullName) {
    $parts = explode(' ', $fullName, 2);
    $first = $parts[0];
    $last  = $parts[1] ?? '';

    $stmt2 = $conn->prepare(
        "UPDATE patients SET first_name = ?, last_name = ? WHERE user_id = ?"
    );
    $stmt2->bind_param('ssi', $first, $last, $id);
    $stmt2->execute();
    $stmt2->close();

    $stmt3 = $conn->prepare(
        "UPDATE doctors SET first_name = ?, last_name = ? WHERE user_id = ?"
    );
    $stmt3->bind_param('ssi', $first, $last, $id);
    $stmt3->execute();
    $stmt3->close();
}

$conn->close();
echo json_encode(['success' => $ok]);
