<?php
// Database configuration
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "optimed_db"; 

// Create connection using the variables
$conn = new mysqli('127.0.0.1', 'root', '', 'optimed_db', 3308);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Échec de la connexion : " . $conn->connect_error]));
}

// These "define" lines stop that "Undefined constant" error
define('DB_HOST', $host);
define('DB_USER', $user);
define('DB_PASS', $pass);
define('DB_NAME', $dbname);
?>
