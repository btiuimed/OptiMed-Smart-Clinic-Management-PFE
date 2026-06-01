<?php
/**
 * api/get_all_appointments.php
 *
 * Retourne TOUS les rendez-vous de la clinique pour l'administrateur.
 *
 * Clés retournées (correspondent exactement à renderAdminAptsTable dans script.js) :
 *   id, patient, email, doctor, service, date, time, status, notes
 */

session_start();
header('Content-Type: application/json');

require 'db_connect.php';

/* ── Auth : admin uniquement ── */
if (empty($_SESSION['ncUser'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Non authentifié.']);
    exit;
}

if ($_SESSION['ncUser']['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Accès réservé aux administrateurs.']);
    exit;
}

/* ── Requête ── */
$result = $conn->query(
    "SELECT
         a.id,
         CONCAT(pt.first_name, ' ', pt.last_name)          AS patient,
         u.email,
         CONCAT(d.first_name,  ' ', d.last_name)           AS doctor,
         COALESCE(dept.name, 'Consultation')                AS service,
         a.appointment_date                                 AS date,
         TIME_FORMAT(a.appointment_time, '%H:%i')           AS time,
         COALESCE(NULLIF(a.status, ''), 'pending')          AS status,
         COALESCE(a.reason, 'Consultation générale')        AS notes
     FROM appointments a
     JOIN patients    pt   ON pt.id   = a.patient_id
     JOIN users       u    ON u.id    = pt.user_id
     JOIN doctors     d    ON d.id    = a.doctor_id
     LEFT JOIN departments dept ON dept.id = d.department_id
     ORDER BY a.appointment_date DESC, a.appointment_time DESC"
);

$appointments = $result->fetch_all(MYSQLI_ASSOC);
$conn->close();

echo json_encode([
    'success'      => true,
    'appointments' => $appointments,
]);
