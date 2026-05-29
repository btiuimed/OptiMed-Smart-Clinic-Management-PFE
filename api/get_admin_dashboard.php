<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

if (!file_exists('db_connect.php')) {
    echo json_encode(["success" => false, "message" => "Fichier db_connect.php introuvable."]);
    exit;
}
require_once 'db_connect.php';

try {
    $stats = ["total_appointments" => 0, "pending_reviews" => 0, "confirmed_appointments" => 0, "total_patients" => 0];
    $recent_appointments = [];
    $activities = [];

    // 1. COMPTEURS STATISTIQUES (Totalement sécurisés)
    $res1 = $conn->query("SELECT COUNT(*) AS count FROM appointments");
    if ($res1) $stats['total_appointments'] = (int)$res1->fetch_assoc()['count'];

    $res2 = $conn->query("SELECT COUNT(*) AS count FROM appointments WHERE status = 'pending' OR status = 'En attente' OR status IS NULL OR status = ''");
    if ($res2) $stats['pending_reviews'] = (int)$res2->fetch_assoc()['count'];

    $res3 = $conn->query("SELECT COUNT(*) AS count FROM appointments WHERE status = 'confirmed' OR status = 'Confirmé'");
    if ($res3) $stats['confirmed_appointments'] = (int)$res3->fetch_assoc()['count'];

    $res4 = $conn->query("SELECT COUNT(*) AS count FROM users WHERE role = 'patient' OR role = 'Patient' OR role = 'user' OR role = 'Patient / Patient'");
    if ($res4) $stats['total_patients'] = (int)$res4->fetch_assoc()['count'];

    // 2. REND_VOUS RÉCENTS (Lecture brute de la table appointments)
    $recentAptsQuery = "SELECT id, reason, appointment_date, status, patient_id FROM appointments ORDER BY id DESC LIMIT 5";
    $recentAptsResult = $conn->query($recentAptsQuery);
    
    if (!$recentAptsResult) throw new Exception("Erreur table appointments: " . $conn->error);

    while ($row = $recentAptsResult->fetch_assoc()) {
        $pId = (int)$row['patient_id'];
        $displayIdentity = "Patient #" . $pId; // Valeur par défaut universelle
        
        if ($pId > 0) {
            // Requête dynamique sécurisée : on prend l'email ou l'id si le reste échoue
            $uRes = $conn->query("SELECT * FROM users WHERE id = $pId");
            if ($uRes && $uRow = $uRes->fetch_assoc()) {
                if (isset($uRow['username'])) {
                    $displayIdentity = $uRow['username'];
                } elseif (isset($uRow['email'])) {
                    $displayIdentity = explode('@', $uRow['email'])[0]; // Extrait la partie avant le @ de l'email
                }
            }
        }

        $recent_appointments[] = [
            "id" => $row['id'],
            "patient_name" => $displayIdentity,
            "reason" => !empty($row['reason']) ? $row['reason'] : 'Consultation',
            "appointment_date" => !empty($row['appointment_date']) ? $row['appointment_date'] : 'Non définie',
            "status" => !empty($row['status']) ? $row['status'] : 'pending'
        ];

        $activities[] = [
            "type" => "appointment",
            "activity_time" => !empty($row['appointment_date']) ? $row['appointment_date'] : 'Récemment',
            "patient_name" => $displayIdentity
        ];
    }

    echo json_encode([
        "success" => true,
        "stats" => $stats,
        "recent_appointments" => $recent_appointments,
        "activities" => $activities
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Erreur SQL : " . $e->getMessage()
    ]);
}
