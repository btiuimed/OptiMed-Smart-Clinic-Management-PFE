<?php
/**
 * api/register.php
 *
 * Inscription d'un nouveau patient.
 * Champs reçus en JSON : firstName, lastName, email, password,
 *                        phone, dob, cne, gender
 */

session_start();
header('Content-Type: application/json');

require 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);

/* ── Récupération et nettoyage des champs ── */
$firstName = trim($body['firstName'] ?? '');
$lastName  = trim($body['lastName']  ?? '');
$email     = trim($body['email']     ?? '');
$password  = trim($body['password']  ?? '');
$phone     = trim($body['phone']     ?? '');
$dob       = trim($body['dob']       ?? '');
$cne       = trim($body['cne']       ?? '');
$gender    = trim($body['gender']    ?? '');

/* ── Validations serveur ── */
if (strlen($firstName) < 2 || strlen($lastName) < 2) {
    echo json_encode(['success' => false, 'message' => 'Nom/Prénom invalide.']);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Adresse e-mail invalide.']);
    exit;
}
if (strlen($password) < 8 || !preg_match('/[A-Z]/', $password) || !preg_match('/[0-9]/', $password)) {
    echo json_encode(['success' => false, 'message' => 'Mot de passe trop faible.']);
    exit;
}
if (empty($cne)) {
    echo json_encode(['success' => false, 'message' => 'Le CNE est requis.']);
    exit;
}
if (!in_array($gender, ['male', 'female'], true)) {
    echo json_encode(['success' => false, 'message' => 'Genre invalide.']);
    exit;
}
// Validation de la date de naissance (format YYYY-MM-DD)
$dobDate = DateTime::createFromFormat('Y-m-d', $dob);
if (!$dobDate || $dobDate->format('Y-m-d') !== $dob) {
    echo json_encode(['success' => false, 'message' => 'Date de naissance invalide.']);
    exit;
}

/* ── Vérifier l'unicité de l'email et du CNE ── */
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
$stmt->bind_param('s', $email);
$stmt->execute();
if ($stmt->get_result()->fetch_assoc()) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Cet email est déjà utilisé.']);
    exit;
}
$stmt->close();

$stmt = $conn->prepare("SELECT id FROM patients WHERE cne = ? LIMIT 1");
$stmt->bind_param('s', $cne);
$stmt->execute();
if ($stmt->get_result()->fetch_assoc()) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Ce CNE est déjà enregistré.']);
    exit;
}
$stmt->close();

/* ── Insertion dans users ── */
$hash = password_hash($password, PASSWORD_BCRYPT);

$stmt = $conn->prepare(
    "INSERT INTO users (email, password, role) VALUES (?, ?, 'patient')"
);
$stmt->bind_param('ss', $email, $hash);
$stmt->execute();
$userId = $conn->insert_id;
$stmt->close();

/* ── Insertion dans patients ── */
$stmt = $conn->prepare(
    "INSERT INTO patients (user_id, first_name, last_name, phone, dob, cne, gender, cancellation_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)"
);
$stmt->bind_param('issssss', $userId, $firstName, $lastName, $phone, $dob, $cne, $gender);
$stmt->execute();
$stmt->close();
$conn->close();

/* ── Créer la session ── */
$_SESSION['ncUser'] = [
    'id'        => $userId,
    'email'     => $email,
    'role'      => 'patient',
    'firstName' => $firstName,
    'lastName'  => $lastName,
];

echo json_encode([
    'success' => true,
    'user'    => $_SESSION['ncUser'],
]);
