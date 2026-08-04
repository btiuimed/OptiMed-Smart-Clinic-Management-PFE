<?php
/**
 * api/rate_appointment.php
 *
 * Permet à un patient de noter un médecin après une consultation terminée.
 *
 * Body JSON : {
 *   appointment_id : int,
 *   rating         : int (1-5),
 *   comment        : string (optionnel)
 * }
 *
 * Sécurités :
 *  - L'utilisateur doit être connecté en tant que patient
 *  - Le rendez-vous doit lui appartenir et avoir le statut 'completed'
 *  - Un RDV ne peut être noté qu'une seule fois
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
if ($user['role'] !== 'patient') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Réservé aux patients.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
    exit;
}

/* ── Payload ── */
$body   = json_decode(file_get_contents('php://input'), true);
$aptId  = isset($body['appointment_id']) ? (int) $body['appointment_id'] : 0;
$rating = isset($body['rating'])         ? (int) $body['rating']         : 0;
$comment = isset($body['comment'])       ? trim($body['comment'])        : '';

if (!$aptId || $rating < 1 || $rating > 5) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Paramètres invalides (rating 1-5 requis).']);
    exit;
}

$userId = (int) $user['id'];

/* ── Vérifier que le RDV appartient bien à ce patient ET est 'completed' ── */
$stmt = $conn->prepare(
    "SELECT a.id, a.status, a.rating
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     WHERE a.id = ? AND p.user_id = ?
     LIMIT 1"
);
$stmt->bind_param('ii', $aptId, $userId);
$stmt->execute();
$apt = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$apt) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Rendez-vous introuvable ou accès refusé.']);
    exit;
}

if ($apt['status'] !== 'completed') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Seuls les rendez-vous terminés peuvent être notés.']);
    exit;
}

if ($apt['rating'] !== null && $apt['rating'] > 0) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Vous avez déjà noté ce rendez-vous.']);
    exit;
}

/* ── Enregistrer la note dans appointments ── */
$stmt = $conn->prepare(
    "UPDATE appointments SET rating = ?, rating_comment = ? WHERE id = ?"
);
$stmt->bind_param('isi', $rating, $comment, $aptId);
$ok = $stmt->execute();
$stmt->close();
$conn->close();

if ($ok) {
    echo json_encode(['success' => true, 'message' => 'Note enregistrée avec succès.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'enregistrement.']);
}
