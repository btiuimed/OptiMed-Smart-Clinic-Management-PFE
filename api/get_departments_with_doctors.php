<?php
session_start();
header('Content-Type: application/json');

require 'db_connect.php';

/* ── Auth admin ── */
if (empty($_SESSION['ncUser']) || $_SESSION['ncUser']['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Accès réservé aux administrateurs.']);
    exit;
}

/* ── Tous les départements ── */
$depts = $conn->query(
    "SELECT id, name, description FROM departments ORDER BY name ASC"
)->fetch_all(MYSQLI_ASSOC);

/* ── Médecins par département ── */
foreach ($depts as &$dept) {
    $stmt = $conn->prepare(
        "SELECT d.first_name, d.last_name, u.email
         FROM doctors d
         JOIN users u ON u.id = d.user_id
         WHERE d.department_id = ?
         ORDER BY d.last_name ASC"
    );
    $stmt->bind_param('i', $dept['id']);
    $stmt->execute();
    $dept['doctors'] = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
}
unset($dept);

$conn->close();

echo json_encode([
    'success'     => true,
    'departments' => $depts,
]);
