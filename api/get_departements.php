<?php
session_start();
header('Content-Type: application/json');

require 'db_connect.php';

// Fetch all departments from the database
$stmt = $conn->prepare("SELECT id, name FROM departments ORDER BY name ASC");
$stmt->execute();
$result = $stmt->get_result();
$departments = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode(['success' => true, 'departments' => $departments]);

$stmt->close();
$conn->close();
?>
