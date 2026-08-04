<?php
/**
 * api/update_profile.php
 *
 * Permet à l'utilisateur connecté (patient) de modifier son propre profil.
 * Met à jour users (email) et patients (first_name, last_name, phone,
 * cne, dob, gender).
 *
 * Note : bloodType et insurance ne sont pas encore en base — ils restent
 * gérés côté session uniquement (pas de colonne dédiée pour le moment).
 */

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

$userId = (int)$_SESSION['ncUser']['id'];
$body   = json_decode(file_get_contents('php://input'), true);

$firstName = trim($body['firstName'] ?? '');
$lastName  = trim($body['lastName']  ?? '');
$email     = trim($body['email']     ?? '');
$phone     = trim($body['phone']     ?? '');
$cne       = trim($body['cne']       ?? '');
$dob       = trim($body['dob']       ?? '');
$gender    = trim($body['gender']    ?? '');

/* ── Validations ── */
if (strlen($firstName) < 2 || strlen($lastName) < 2) {
    echo json_encode(['success' => false, 'message' => 'Nom/Prénom invalide.']);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Adresse e-mail invalide.']);
    exit;
}
if ($gender !== '' && !in_array($gender, ['male', 'female'], true)) {
    echo json_encode(['success' => false, 'message' => 'Genre invalide.']);
    exit;
}
if ($dob !== '') {
    $dobDate = DateTime::createFromFormat('Y-m-d', $dob);
    if (!$dobDate || $dobDate->format('Y-m-d') !== $dob) {
        echo json_encode(['success' => false, 'message' => 'Date de naissance invalide.']);
        exit;
    }
}

/* ── Vérifier que l'email n'est pas déjà pris par un AUTRE compte ── */
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1");
$stmt->bind_param('si', $email, $userId);
$stmt->execute();
if ($stmt->get_result()->fetch_assoc()) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Cet email est déjà utilisé par un autre compte.']);
    exit;
}
$stmt->close();

/* ── Vérifier l'unicité du CNE (sauf pour ce patient) ── */
if ($cne !== '') {
    $stmt = $conn->prepare(
        "SELECT p.id FROM patients p
         WHERE p.cne = ? AND p.user_id != ? LIMIT 1"
    );
    $stmt->bind_param('si', $cne, $userId);
    $stmt->execute();
    if ($stmt->get_result()->fetch_assoc()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Ce CNE est déjà utilisé par un autre patient.']);
        exit;
    }
    $stmt->close();
}

/* ── Mise à jour users.email ── */
$stmt = $conn->prepare("UPDATE users SET email = ? WHERE id = ?");
$stmt->bind_param('si', $email, $userId);
$stmt->execute();
$stmt->close();

/* ── Mise à jour patients ── */
$stmt = $conn->prepare(
    "UPDATE patients
     SET first_name = ?, last_name = ?, phone = ?, cne = ?, dob = ?, gender = ?
     WHERE user_id = ?"
);
$dobValue = $dob !== '' ? $dob : null;
$stmt->bind_param('ssssssi', $firstName, $lastName, $phone, $cne, $dobValue, $gender, $userId);
$ok = $stmt->execute();
$stmt->close();
$conn->close();

if ($ok) {
    // Mettre à jour la session pour refléter les nouvelles valeurs
    $_SESSION['ncUser']['firstName'] = $firstName;
    $_SESSION['ncUser']['lastName']  = $lastName;
    $_SESSION['ncUser']['email']     = $email;
    $_SESSION['ncUser']['phone']     = $phone;
    $_SESSION['ncUser']['cne']       = $cne;
    $_SESSION['ncUser']['dob']       = $dob;
    $_SESSION['ncUser']['gender']    = $gender;
    $_SESSION['ncUser']['initials']  = strtoupper(substr($firstName, 0, 1) . substr($lastName, 0, 1));

    echo json_encode(['success' => true, 'message' => 'Profil mis à jour.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur lors de la mise à jour.']);
<?php
/**
 * api/update_profile.php
 *
 * Permet à l'utilisateur connecté (patient) de modifier son propre profil.
 * Met à jour users (email) et patients (first_name, last_name, phone,
 * cne, dob, gender).
 *
 * Note : bloodType et insurance ne sont pas encore en base — ils restent
 * gérés côté session uniquement (pas de colonne dédiée pour le moment).
 */

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

$userId = (int)$_SESSION['ncUser']['id'];
$body   = json_decode(file_get_contents('php://input'), true);

$firstName = trim($body['firstName'] ?? '');
$lastName  = trim($body['lastName']  ?? '');
$email     = trim($body['email']     ?? '');
$phone     = trim($body['phone']     ?? '');
$cne       = trim($body['cne']       ?? '');
$dob       = trim($body['dob']       ?? '');
$gender    = trim($body['gender']    ?? '');

/* ── Validations ── */
if (strlen($firstName) < 2 || strlen($lastName) < 2) {
    echo json_encode(['success' => false, 'message' => 'Nom/Prénom invalide.']);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Adresse e-mail invalide.']);
    exit;
}
if ($gender !== '' && !in_array($gender, ['male', 'female'], true)) {
    echo json_encode(['success' => false, 'message' => 'Genre invalide.']);
    exit;
}
if ($dob !== '') {
    $dobDate = DateTime::createFromFormat('Y-m-d', $dob);
    if (!$dobDate || $dobDate->format('Y-m-d') !== $dob) {
        echo json_encode(['success' => false, 'message' => 'Date de naissance invalide.']);
        exit;
    }
}

/* ── Vérifier que l'email n'est pas déjà pris par un AUTRE compte ── */
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1");
$stmt->bind_param('si', $email, $userId);
$stmt->execute();
if ($stmt->get_result()->fetch_assoc()) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Cet email est déjà utilisé par un autre compte.']);
    exit;
}
$stmt->close();

/* ── Vérifier l'unicité du CNE (sauf pour ce patient) ── */
if ($cne !== '') {
    $stmt = $conn->prepare(
        "SELECT p.id FROM patients p
         WHERE p.cne = ? AND p.user_id != ? LIMIT 1"
    );
    $stmt->bind_param('si', $cne, $userId);
    $stmt->execute();
    if ($stmt->get_result()->fetch_assoc()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Ce CNE est déjà utilisé par un autre patient.']);
        exit;
    }
    $stmt->close();
}

/* ── Mise à jour users.email ── */
$stmt = $conn->prepare("UPDATE users SET email = ? WHERE id = ?");
$stmt->bind_param('si', $email, $userId);
$stmt->execute();
$stmt->close();

/* ── Mise à jour patients ── */
$stmt = $conn->prepare(
    "UPDATE patients
     SET first_name = ?, last_name = ?, phone = ?, cne = ?, dob = ?, gender = ?
     WHERE user_id = ?"
);
$dobValue = $dob !== '' ? $dob : null;
$stmt->bind_param('ssssssi', $firstName, $lastName, $phone, $cne, $dobValue, $gender, $userId);
$ok = $stmt->execute();
$stmt->close();
$conn->close();

if ($ok) {
    // Mettre à jour la session pour refléter les nouvelles valeurs
    $_SESSION['ncUser']['firstName'] = $firstName;
    $_SESSION['ncUser']['lastName']  = $lastName;
    $_SESSION['ncUser']['email']     = $email;
    $_SESSION['ncUser']['phone']     = $phone;
    $_SESSION['ncUser']['cne']       = $cne;
    $_SESSION['ncUser']['dob']       = $dob;
    $_SESSION['ncUser']['gender']    = $gender;
    $_SESSION['ncUser']['initials']  = strtoupper(substr($firstName, 0, 1) . substr($lastName, 0, 1));

    echo json_encode(['success' => true, 'message' => 'Profil mis à jour.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur lors de la mise à jour.']);
}}
