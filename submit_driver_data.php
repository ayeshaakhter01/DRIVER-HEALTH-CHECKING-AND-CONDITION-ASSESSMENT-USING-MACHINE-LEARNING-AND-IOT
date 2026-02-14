
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

// Check if the form was submitted via POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve the form data
    $pulse_rate = $_POST['pulse_rate'];
    $oxygen_level = $_POST['oxygen_level'];
    $body_temperature = $_POST['body_temperature'];
    $alcohol_level = $_POST['alcohol_level'];
    $reaction_time = $_POST['reaction_time'];
    $years_driving = $_POST['years_driving'];
    $know_drive = $_POST['know_drive'];

    // Optional: Additional data
    $vision_issues = $_POST['vision_issues'];
    $night_blindness = $_POST['night_blindness'];

    // Insert the data into the database (drivers table)
    $sql = "INSERT INTO drivers (pulse_rate, oxygen_level, body_temperature, alcohol_level, reaction_time, years_driving, know_driving, vision_issues, night_blindness, status)
            VALUES ('$pulse_rate', '$oxygen_level', '$body_temperature', '$alcohol_level', '$reaction_time', '$years_driving', '$know_drive', '$vision_issues', '$night_blindness', 'Unfit')";

    if ($conn->query($sql) === TRUE) {
        echo "Health data recorded successfully";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }

    // Close the database connection
    $conn->close();
}
?>
