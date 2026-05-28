<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

try {
    // SQL query joining doctors and departments to display names and specialties cleanly
    $query = "SELECT d.id, d.first_name, d.last_name, d.phone, dept.name AS department_name 
              FROM doctors d 
              LEFT JOIN departments dept ON d.department_id = dept.id
              ORDER BY d.id DESC";
              
    $result = $conn->query($query);
    $doctors = [];

    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $doctors[] = $row;
        }
        echo json_encode(["success" => true, "doctors" => $doctors]);
    } else {
        echo json_encode(["success" => false, "message" => "Database query failed."]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
