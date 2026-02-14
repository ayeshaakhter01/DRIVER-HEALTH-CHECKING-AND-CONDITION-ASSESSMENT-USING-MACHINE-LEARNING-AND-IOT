<?php
// Database connection details
$servername = "localhost";   // MySQL server (usually localhost)
$username = "root";          // MySQL username (default for XAMPP is 'root')
$password = "";              // MySQL password (default for XAMPP is empty)
$dbname = "driver_health_monitor";  // Database name (replace with your actual database name)

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
