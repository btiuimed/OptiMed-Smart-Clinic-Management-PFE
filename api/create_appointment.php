<?php
/**
 * api/create_appointment.php
 *
 * Crée un rendez-vous pour le patient connecté.
 * La session contient user_id (table users) — on résout
 * patient_id via JOIN avant d'insérer dans appointments.
 *
 * Body JSON : {
 *   doctor_id        : int,
 *   appointment_date : 'YYYY-MM-DD',
 *   appointment_time : 'HH:MM',
 *   reason           : string
 * }
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

$sessionUser = $_SESSION['ncUser'];

if ($sessionUser['role'] !== 'patient') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Réservation réservée aux patients.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
    exit;
}

/* ── Payload ── */
$body   = json_decode(file_get_contents('php://input'), true);
$doctorId = isset($body['doctor_id'])        ? (int)   $body['doctor_id']        : 0;
$date     = isset($body['appointment_date']) ? trim($body['appointment_date'])    : '';
$time     = isset($body['appointment_time']) ? trim($body['appointment_time'])    : '';
$reason   = isset($body['reason'])           ? trim($body['reason'])              : 'Consultation';

/* ── Validation basique ── */
if (!$doctorId || !$date || !$time) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Médecin, date et heure sont requis.']);
    exit;
}

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Format de date invalide (YYYY-MM-DD attendu).']);
    exit;
}

if (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $time)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Format d\'heure invalide (HH:MM attendu).']);
    exit;
}

/* ── Résolution patient_id depuis user_id de session ────────────
 *
 *  C'est le point critique : la session stocke users.id,
 *  mais appointments référence patients.id (PK de la table patients).
 *  Sans cette résolution, l'insertion échouerait silencieusement
 *  ou créerait un RDV avec un mauvais patient_id.
 * ─────────────────────────────────────────────────────────────── */
$userId = (int) $sessionUser['id'];

$stmt = $conn->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
$stmt->bind_param('i', $userId);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$row) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Profil patient introuvable pour cet utilisateur.']);
    exit;
}

$patientId = (int) $row['id'];

/* ── Vérifier que le médecin existe ── */
$stmt = $conn->prepare("SELECT id FROM doctors WHERE id = ? LIMIT 1");
$stmt->bind_param('i', $doctorId);
$stmt->execute();
$doctorExists = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$doctorExists) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Médecin introuvable.']);
    exit;
}

/* ── Vérifier la disponibilité du créneau ── */
$stmt = $conn->prepare(
    "SELECT id FROM appointments
     WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ?
     AND status NOT IN ('cancelled')
     LIMIT 1"
);
$stmt->bind_param('iss', $doctorId, $date, $time);
$stmt->execute();
$conflict = $stmt->get_result()->fetch_assoc();
$stmt->close();

if ($conflict) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Ce créneau est déjà réservé. Veuillez en choisir un autre.']);
    exit;
}

/* ── Insertion ── */
$stmt = $conn->prepare(
    "INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, reason)
     VALUES (?, ?, ?, ?, 'pending', ?)"
);
$stmt->bind_param('iisss', $patientId, $doctorId, $date, $time, $reason);
$ok = $stmt->execute();
$newId = $stmt->insert_id;
$stmt->close();
$conn->close();

if ($ok) {
    echo json_encode([
        'success'        => true,
        'appointment_id' => $newId,
        'message'        => 'Rendez-vous créé avec succès.',
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur lors de la création du rendez-vous.']);
}
