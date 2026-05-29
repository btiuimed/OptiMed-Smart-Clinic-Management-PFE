<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
require_once 'db_connect.php';

try {
    $appointments = [];

    // Récupération de tous les rendez-vous, du plus récent au plus ancien
    $query = "SELECT id, reason, appointment_date, appointment_time, status, patient_id, doctor_id FROM appointments ORDER BY id DESC";
    $result = $conn->query($query);
    
    if (!$result) throw new Exception("Erreur base de données : " . $conn->error);

    while ($row = $result->fetch_assoc()) {
        $pId = (int)$row['patient_id'];
        $patientName = "Patient #" . $pId;
        $patientEmail = "Non renseigné";
        
        // 1. Récupération dynamique des infos du patient
        if ($pId > 0) {
            $uRes = $conn->query("SELECT * FROM users WHERE id = $pId");
            if ($uRes && $uRow = $uRes->fetch_assoc()) {
                if (isset($uRow['username'])) {
                    $patientName = $uRow['username'];
                }
                if (isset($uRow['email'])) {
                    $patientEmail = $uRow['email'];
                    if (!isset($uRow['username'])) {
                        $patientName = explode('@', $uRow['email'])[0];
                    }
                }
            }
        }

        // 2. Attribution d'un médecin fictif ou réel pour l'affichage (colonne doctor_id)
        $doctorName = "Dr. Sarah Mohamed"; 
        if ((int)$row['doctor_id'] % 2 === 0) {
            $doctorName = "Dr. Emily Chen";
        }

        // Status par défaut si vide
        $status = !empty($row['status']) ? $row['status'] : 'pending';

        $appointments[] = [
            "id" => "APT" . str_pad($row['id'], 3, '0', STR_PAD_LEFT), // Formate l'ID en APT019, APT020...
            "patient_name" => $patientName,
            "patient_email" => $patientEmail,
            "doctor" => $doctorName,
            "service" => !empty($row['reason']) ? $row['reason'] : 'Consultation',
            "date_time" => $row['appointment_date'] . " à " . (!empty($row['appointment_time']) ? $row['appointment_time'] : "00:00"),
            "status" => $status
        ];
    }

    echo json_encode([
        "success" => true,
        "appointments" => $appointments
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
        "appointments" => []
    ]);
}
