<?php
$host = 'localhost';
$user = 'root';
// $pass = 'C0mput01tnn@2025'; // Password requested by user (Uncomment if needed)
$pass = ''; // Default XAMPP password (working in current env)
$dbname = 'itnn_living_lab';

$mysqli = new mysqli($host, $user, $pass);

if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Create database if it doesn't exist
$mysqli->query("CREATE DATABASE IF NOT EXISTS $dbname");
$mysqli->select_db($dbname);
?>
