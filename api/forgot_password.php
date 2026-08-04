<?php
/**
 * api/forgot_password.php
 *
 * 1. Vérifie si l'email existe dans users
 * 2. Génère un token sécurisé + expiry (+1h)
 * 3. Stocke le token dans users (colonnes reset_token, token_expiry)
 * 4. Simule l'envoi email (log dans error_log pour les tests)
 *
 * SQL à exécuter UNE FOIS dans phpMyAdmin :
 *   ALTER TABLE users
 *     ADD COLUMN reset_token  VARCHAR(64)  DEFAULT NULL,
 *     ADD COLUMN token_expiry DATETIME     DEFAULT NULL;
 */

session_start();
header('Content-Type: application/json');

require 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
    exit;
}

$body  = json_decode(file_get_contents('php://input'), true);
$email = trim($body['email'] ?? '');

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Adresse e-mail invalide.']);
    exit;
}

/* ── Vérifier si l'email existe ── */
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
$stmt->bind_param('s', $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$user) {
    // Sécurité : ne pas révéler si l'email existe ou non
    echo json_encode([
        'success' => true,
        'message' => 'Si cet email est enregistré, vous recevrez un lien sous peu.',
    ]);
    exit;
}

/* ── Générer le token ── */
$token   = bin2hex(random_bytes(32));
$expiry  = date('Y-m-d H:i:s', strtotime('+1 hour'));

$stmt = $conn->prepare(
    "UPDATE users SET reset_token = ?, token_expiry = ? WHERE id = ?"
);
$stmt->bind_param('ssi', $token, $expiry, $user['id']);
$stmt->execute();
$stmt->close();
$conn->close();

/* ── Simuler l'envoi email (remplacer par mail() en production) ── */
$resetLink = "http://localhost/OptiMed/reset-password?token={$token}";
error_log("[OptiMed] Reset link for {$email}: {$resetLink}");

/*
 * En production, remplacer le error_log par :
 *
 * mail(
 *   $email,
 *   'Réinitialisation de votre mot de passe OptiMed',
 *   "Cliquez ici pour réinitialiser : {$resetLink}\n\nLien valide 1 heure.",
 *   "From: noreply@optimed.fr\r\nContent-Type: text/plain; charset=UTF-8"
 * );
 */

echo json_encode([
    'success' => true,
    'message' => 'Lien de réinitialisation envoyé ! Vérifiez votre boîte e-mail.',
    // Retirer en production — uniquement pour les tests :
    '_debug_token' => $token,
    '_debug_link'  => $resetLink,
]);
