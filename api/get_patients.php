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
    "SELECT
         p.id, p.first_name, p.last_name, p.phone, p.dob,
         p.cancellation_count,
         u.email,
         COUNT(a.id)          AS total_visits,
         MAX(a.appointment_date) AS last_visit
     FROM patients p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN appointments a ON a.patient_id = p.id
     GROUP BY p.id
     ORDER BY p.last_name ASC"
);

echo json_encode([
    'success'  => true,
    'patients' => $result->fetch_all(MYSQLI_ASSOC),
]);
