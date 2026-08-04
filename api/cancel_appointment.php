<?php
session_start();
header('Content-Type: application/json');
require 'db_connect.php';

if (empty($_SESSION['ncUser'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Non authentifié.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
    exit;
}

$body  = json_decode(file_get_contents('php://input'), true);
$aptId = (int)($body['id'] ?? 0);

if (!$aptId) {
    echo json_encode(['success' => false, 'message' => 'ID invalide.']);
    exit;
}

$userId = (int)$_SESSION['ncUser']['id'];
$role   = $_SESSION['ncUser']['role'];

// Vérifier que le RDV appartient bien au patient connecté
if ($role === 'patient') {
    $stmt = $conn->prepare(
        "SELECT a.id FROM appointments a
         JOIN patients p ON p.id = a.patient_id
         WHERE a.id = ? AND p.user_id = ?
         AND a.status IN ('pending','confirmed')
         LIMIT 1"
    );
    $stmt->bind_param('ii', $aptId, $userId);
    $stmt->execute();
    $owned = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$owned) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Rendez-vous introuvable ou déjà annulé.']);
        exit;
    }
}

// Mise à jour du statut + incrément du compteur d'annulations
$stmt = $conn->prepare(
    "UPDATE appointments SET status = 'cancelled' WHERE id = ?"
);
$stmt->bind_param('i', $aptId);
$ok = $stmt->execute();
$stmt->close();

// Incrémenter cancellation_count du patient
if ($ok && $role === 'patient') {
    $stmt2 = $conn->prepare(
        "UPDATE patients SET cancellation_count = cancellation_count + 1
         WHERE user_id = ?"
    );
    $stmt2->bind_param('i', $userId);
    $stmt2->execute();
    $stmt2->close();
}

$conn->close();
echo json_encode(['success' => $ok]);
