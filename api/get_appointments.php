<?php
/**
 * api/get_appointments.php  — Version corrigée et synchronisée
 *
 * Retourne TOUJOURS les mêmes clés JSON quelle que soit le rôle :
 *   id, date, time, status, notes, doctor, service
 *   + patient, email   (admin seulement)
 *
 * Ces clés correspondent EXACTEMENT à ce qu'attend le JS :
 *   apt.date   apt.time   apt.doctor   apt.service   apt.status   apt.notes
 */

session_start();
header('Content-Type: application/json');

require 'db_connect.php';

/* ── Authentification ─────────────────────────────────────────────── */
if (empty($_SESSION['ncUser'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
    exit;
}

$sessionUser = $_SESSION['ncUser'];
$userId      = (int) $sessionUser['id'];
$role        = $sessionUser['role'];

/* ── Requête selon le rôle ────────────────────────────────────────── */
if ($role === 'patient') {

    /*
     * FIX : La jointure précédente (u.id = p.user_id OR u.id = a.user_id)
     * était incorrecte. La table appointments n'a pas de colonne user_id ;
     * elle référence patient_id qui pointe sur patients.id (PK), pas sur users.id.
     *
     * Chemin correct :
     *   users.id  →  patients.user_id  →  patients.id  →  appointments.patient_id
     */
    $stmt = $conn->prepare(
        "SELECT
            a.id,
            a.appointment_date  AS `date`,
            a.appointment_time  AS `time`,
            a.status,
            a.reason            AS notes,
            CONCAT(d.first_name, ' ', d.last_name) AS doctor,
            dept.name           AS service
         FROM appointments a
         JOIN patients  p    ON p.id          = a.patient_id
         JOIN doctors   d    ON d.id          = a.doctor_id
         LEFT JOIN departments dept ON dept.id = d.department_id
         WHERE p.user_id = ?
         ORDER BY a.appointment_date DESC, a.appointment_time DESC"
    );
    $stmt->bind_param('i', $userId);

} elseif ($role === 'doctor') {

    /*
     * Le docteur voit les RDV qui lui sont assignés.
     * On identifie le docteur via doctors.user_id = session user id.
     */
    $stmt = $conn->prepare(
        "SELECT
            a.id,
            a.appointment_date  AS `date`,
            a.appointment_time  AS `time`,
            a.status,
            a.reason            AS notes,
            CONCAT(d.first_name, ' ', d.last_name) AS doctor,
            dept.name           AS service,
            CONCAT(pt.first_name, ' ', pt.last_name) AS patient,
            u.email
         FROM appointments a
         JOIN doctors   d    ON d.id          = a.doctor_id
         JOIN patients  pt   ON pt.id         = a.patient_id
         JOIN users     u    ON u.id          = pt.user_id
         LEFT JOIN departments dept ON dept.id = d.department_id
         WHERE d.user_id = ?
         ORDER BY a.appointment_date DESC, a.appointment_time DESC"
    );
    $stmt->bind_param('i', $userId);

} elseif ($role === 'admin') {

    $stmt = $conn->prepare(
        "SELECT
            a.id,
            a.appointment_date  AS `date`,
            a.appointment_time  AS `time`,
            a.status,
            a.reason            AS notes,
            CONCAT(d.first_name,  ' ', d.last_name)  AS doctor,
            dept.name           AS service,
            CONCAT(pt.first_name, ' ', pt.last_name) AS patient,
            u.email
         FROM appointments a
         JOIN patients  pt   ON pt.id   = a.patient_id
         JOIN users     u    ON u.id    = pt.user_id
         JOIN doctors   d    ON d.id    = a.doctor_id
         LEFT JOIN departments dept ON dept.id = d.department_id
         ORDER BY a.appointment_date DESC, a.appointment_time DESC"
    );

} else {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden.']);
    exit;
}

$stmt->execute();
$rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();
$conn->close();

/*
 * Normalisation finale : s'assurer que les champs toujours présents
 * ont une valeur par défaut plutôt que null (évite les crashes JS côté template).
 */
$rows = array_map(function ($row) {
    return [
        'id'      => (int) $row['id'],
        'date'    => $row['date']    ?? '',
        'time'    => $row['time']    ?? '',
        'status'  => $row['status']  ?? 'pending',
        'notes'   => $row['notes']   ?? '',
        'doctor'  => $row['doctor']  ?? 'N/A',
        'service' => $row['service'] ?? 'Consultation',
        // Champs admin/doctor uniquement — null si absent (le JS fait déjà une vérif)
        'patient' => $row['patient'] ?? null,
        'email'   => $row['email']   ?? null,
    ];
}, $rows);

echo json_encode(['success' => true, 'appointments' => $rows]);
