<?php

session_start();
header('Content-Type: application/json');

require 'db_connect.php';

/* ── Auth ──────────────────────────────────────────────────────── */
if (empty($_SESSION['ncUser'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Non authentifié.']);
    exit;
}

$user = $_SESSION['ncUser'];
if (!in_array($user['role'], ['doctor', 'admin'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Permission refusée.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
    exit;
}

/* ── Payload ───────────────────────────────────────────────────── */
$body   = json_decode(file_get_contents('php://input'), true);
$aptId  = isset($body['id'])     ? (int) $body['id']     : 0;
$status = isset($body['status']) ? trim($body['status']) : '';

$allowed = ['pending', 'confirmed', 'completed', 'cancelled'];
if (!$aptId || !in_array($status, $allowed)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Paramètres invalides.']);
    exit;
}

/* ── Vérifier que le médecin est bien propriétaire du RDV ───────── */
if ($user['role'] === 'doctor') {
    $stmt = $conn->prepare(
        "SELECT a.id FROM appointments a
         JOIN doctors d ON d.id = a.doctor_id
         WHERE a.id = ? AND d.user_id = ?
         LIMIT 1"
    );
    $userId = (int) $user['id'];
    $stmt->bind_param('ii', $aptId, $userId);
    $stmt->execute();
    $owned = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$owned) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Ce rendez-vous ne vous appartient pas.']);
        exit;
    }
}

/* ── Mise à jour ────────────────────────────────────────────────── */
$stmt = $conn->prepare("UPDATE appointments SET status = ? WHERE id = ?");
$stmt->bind_param('si', $status, $aptId);
$ok = $stmt->execute();
$stmt->close();
$conn->close();

if ($ok) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur lors de la mise à jour.']);
}
