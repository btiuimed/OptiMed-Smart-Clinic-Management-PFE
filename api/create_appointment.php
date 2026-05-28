<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Inclure la connexion à la base de données
require_once 'db_connect.php';

// Récupérer le contenu de la requête POST JSON
$inputData = file_get_contents('php://input');
$data = json_decode($inputData, true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Données JSON invalides ou vides."]);
    exit;
}

// Extraction et validation des variables indispensables
$doctor_id = isset($data['doctor_id']) ? intval($data['doctor_id']) : 0;
$appointment_date = isset($data['appointment_date']) ? $data['appointment_date'] : '';
$appointment_time = isset($data['appointment_time']) ? $data['appointment_time'] : '';
$reason = isset($data['reason']) ? $data['reason'] : 'Consultation';

// Simuler ou récupérer l'ID du patient (pour vos tests, on met 1 si vous n'avez pas de session active)
$patient_id = 1; 

if ($doctor_id === 0 || empty($appointment_date) || empty($appointment_time)) {
    echo json_encode(["success" => false, "message" => "doctor_id, date et time sont requis."]);
    exit;
}

try {
    // Requête d'insertion SQL sécurisée (à adapter selon les noms exacts de vos colonnes)
    $query = "INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status) 
              VALUES (?, ?, ?, ?, ?, 'En attente')";
              
    $stmt = $conn->prepare($query);
    if ($stmt) {
        $stmt->bind_param("iisss", $patient_id, $doctor_id, $appointment_date, $appointment_time, $reason);
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Rendez-vous enregistré avec succès !"]);
        } else {
            echo json_encode(["success" => false, "message" => "Erreur lors de l'exécution : " . $stmt->error]);
        }
        $stmt->close();
    } else {
        echo json_encode(["success" => false, "message" => "Erreur de préparation SQL : " . $conn->error]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Exception serveur : " . $e->getMessage()]);
}

$conn->close();<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Inclure la connexion à la base de données
require_once 'db_connect.php';

// Récupérer le contenu de la requête POST JSON
$inputData = file_get_contents('php://input');
$data = json_decode($inputData, true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Données JSON invalides ou vides."]);
    exit;
}

// Extraction et validation des variables indispensables
$doctor_id = isset($data['doctor_id']) ? intval($data['doctor_id']) : 0;
$appointment_date = isset($data['appointment_date']) ? $data['appointment_date'] : '';
$appointment_time = isset($data['appointment_time']) ? $data['appointment_time'] : '';
$reason = isset($data['reason']) ? $data['reason'] : 'Consultation';

// Simuler ou récupérer l'ID du patient (pour vos tests, on met 1 si vous n'avez pas de session active)
$patient_id = 1; 

if ($doctor_id === 0 || empty($appointment_date) || empty($appointment_time)) {
    echo json_encode(["success" => false, "message" => "doctor_id, date et time sont requis."]);
    exit;
}

try {
    // Requête d'insertion SQL sécurisée (à adapter selon les noms exacts de vos colonnes)
    $query = "INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status) 
              VALUES (?, ?, ?, ?, ?, 'En attente')";
              
    $stmt = $conn->prepare($query);
    if ($stmt) {
        $stmt->bind_param("iisss", $patient_id, $doctor_id, $appointment_date, $appointment_time, $reason);
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Rendez-vous enregistré avec succès !"]);
        } else {
            echo json_encode(["success" => false, "message" => "Erreur lors de l'exécution : " . $stmt->error]);
        }
        $stmt->close();
    } else {
        echo json_encode(["success" => false, "message" => "Erreur de préparation SQL : " . $conn->error]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Exception serveur : " . $e->getMessage()]);
}

$conn->close();
