<?php
/**
 * api/get_doctor_patients.php
 *
 * Retourne tous les patients distincts ayant eu un RDV avec ce médecin,
 * avec statistiques agrégées + historique détaillé par patient.
 *
 * Structure attendue par initDocPatients() dans script.js :
 *   data.patients[] : { patient_id, full_name, email, phone, dob,
 *                       total_visits, last_visit, last_status }
 *   data.history{}  : { [patient_id]: [{ date, time, reason, status }] }
 */

session_start();
header('Content-Type: application/json');
require 'db_connect.php';

/* ── Auth ── */
if (empty($_SESSION['ncUser'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Non authentifié.']);
    exit;
}

$user = $_SESSION['ncUser'];
if ($user['role'] !== 'doctor') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Accès réservé aux médecins.']);
    exit;
}

$userId = (int) $user['id'];

/* ── ID interne du médecin ── */
$stmt = $conn->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
$stmt->bind_param('i', $userId);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$row) {
    echo json_encode([
        'success'  => true,
        'patients' => [],
        'history'  => (object)[],
    ]);
    $conn->close();
    exit;
}

$doctorId = (int) $row['id'];

/* ── Liste patients avec stats agrégées ── */
$stmt = $conn->prepare(
    "SELECT
         pt.id                                              AS patient_id,
         CONCAT(pt.first_name, ' ', pt.last_name)          AS full_name,
         u.email,
         COALESCE(pt.phone, '—')                           AS phone,
         pt.dob,
         COUNT(a.id)                                        AS total_visits,
         MAX(a.appointment_date)                            AS last_visit,
         COALESCE(NULLIF(
             (SELECT COALESCE(NULLIF(a2.status, ''), 'pending')
              FROM appointments a2
              WHERE a2.patient_id = pt.id
                AND a2.doctor_id  = ?
              ORDER BY a2.appointment_date DESC, a2.appointment_time DESC
              LIMIT 1
             ), ''), 'pending')                             AS last_status
     FROM appointments a
     JOIN patients pt ON pt.id = a.patient_id
     JOIN users   u   ON u.id  = pt.user_id
     WHERE a.doctor_id = ?
     GROUP BY pt.id, pt.first_name, pt.last_name, u.email, pt.phone, pt.dob
     ORDER BY last_visit DESC"
);
$stmt->bind_param('ii', $doctorId, $doctorId);
$stmt->execute();
$patients = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

/* ── Historique détaillé par patient ── */
$history = [];

if (!empty($patients)) {
    $ids          = array_map(fn($p) => (int) $p['patient_id'], $patients);
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $types        = 'i' . str_repeat('i', count($ids)); // doctor_id + N patient_ids

    $sql = "SELECT
                a.patient_id,
                a.appointment_date                              AS date,
                TIME_FORMAT(a.appointment_time, '%H:%i')       AS time,
                COALESCE(a.reason, 'Consultation générale')    AS reason,
                COALESCE(NULLIF(a.status, ''), 'pending')      AS status
            FROM appointments a
            WHERE a.doctor_id = ?
              AND a.patient_id IN ($placeholders)
            ORDER BY a.appointment_date DESC, a.appointment_time DESC";

    $stmt = $conn->prepare($sql);
    $params = array_merge([$doctorId], $ids);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $allHistory = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    // Grouper par patient_id
    foreach ($allHistory as $h) {
        $pid = (int) $h['patient_id'];
        unset($h['patient_id']); // inutile côté JS, patient_id est déjà la clé
        $history[$pid][] = $h;
    }
}

$conn->close();

echo json_encode([
    'success'  => true,
    'patients' => $patients,
    'history'  => $history ?: (object)[], // objet vide si aucun historique
]);
