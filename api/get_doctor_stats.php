<?php
// api/get_doctor_stats.php
session_start();
header('Content-Type: application/json');

require 'db_connect.php';

// Auth guard — doctor only
if (empty($_SESSION['ncUser']) || $_SESSION['ncUser']['role'] !== 'doctor') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Doctor access required.']);
    exit;
}

$userId = (int)$_SESSION['ncUser']['id'];

// Resolve doctor profile id from user id
$stmtDoc = $conn->prepare("SELECT id, department_id FROM doctors WHERE user_id = ? LIMIT 1");
$stmtDoc->bind_param('i', $userId);
$stmtDoc->execute();
$doctor = $stmtDoc->get_result()->fetch_assoc();
$stmtDoc->close();

if (!$doctor) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Doctor profile not found.']);
    exit;
}

$doctorId = (int)$doctor['id'];
$today    = date('Y-m-d');

// ── Stat 1: Today's total consultations ──────────────────────────────────────
$stmtTotal = $conn->prepare(
    "SELECT COUNT(*) AS cnt FROM appointments
     WHERE doctor_id = ? AND appointment_date = ?
       AND status NOT IN ('cancelled')"
);
$stmtTotal->bind_param('is', $doctorId, $today);
$stmtTotal->execute();
$totalToday = (int)$stmtTotal->get_result()->fetch_assoc()['cnt'];
$stmtTotal->close();

// ── Stat 2: Pending (waiting room) ───────────────────────────────────────────
$stmtPending = $conn->prepare(
    "SELECT COUNT(*) AS cnt FROM appointments
     WHERE doctor_id = ? AND appointment_date = ? AND status = 'pending'"
);
$stmtPending->bind_param('is', $doctorId, $today);
$stmtPending->execute();
$pending = (int)$stmtPending->get_result()->fetch_assoc()['cnt'];
$stmtPending->close();

// ── Stat 3: Completed today ───────────────────────────────────────────────────
$stmtDone = $conn->prepare(
    "SELECT COUNT(*) AS cnt FROM appointments
     WHERE doctor_id = ? AND appointment_date = ? AND status = 'completed'"
);
$stmtDone->bind_param('is', $doctorId, $today);
$stmtDone->execute();
$completed = (int)$stmtDone->get_result()->fetch_assoc()['cnt'];
$stmtDone->close();

// ── Stat 4: Upcoming appointments (today, not yet done/cancelled) ─────────────
// Also fetch the next appointment time for display
$stmtNext = $conn->prepare(
    "SELECT a.appointment_time,
            CONCAT(p.first_name, ' ', p.last_name) AS patient_name
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     WHERE a.doctor_id = ? AND a.appointment_date = ?
       AND a.status IN ('pending', 'confirmed')
     ORDER BY a.appointment_time ASC
     LIMIT 1"
);
$stmtNext->bind_param('is', $doctorId, $today);
$stmtNext->execute();
$nextApt = $stmtNext->get_result()->fetch_assoc();
$stmtNext->close();

// ── Today's full appointment list (for the mini-table) ───────────────────────
$stmtList = $conn->prepare(
    "SELECT a.id, a.appointment_time AS time, a.status, a.reason,
            CONCAT(p.first_name, ' ', p.last_name) AS patient_name
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     WHERE a.doctor_id = ? AND a.appointment_date = ?
       AND a.status NOT IN ('cancelled')
     ORDER BY a.appointment_time ASC"
);
$stmtList->bind_param('is', $doctorId, $today);
$stmtList->execute();
$todayList = $stmtList->get_result()->fetch_all(MYSQLI_ASSOC);
$stmtList->close();

$conn->close();

echo json_encode([
    'success'    => true,
    'stats' => [
        'total_today' => $totalToday,
        'pending'     => $pending,
        'completed'   => $completed,
        'next_apt'    => $nextApt ?: null,   // null if no more appointments today
    ],
    'today_list' => $todayList,
]);
