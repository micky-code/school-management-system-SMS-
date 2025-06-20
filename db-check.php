<?php
// Database connection parameters
$host = '127.0.0.1';
$user = 'root';
$password = '';
$database = 'sms_db';

// Create connection
$conn = new mysqli($host, $user, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get table structure
$sql = "DESCRIBE tbl_student";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo "<h2>tbl_student Structure:</h2>";
    echo "<table border='1'>";
    echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
    
    while($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $row["Field"] . "</td>";
        echo "<td>" . $row["Type"] . "</td>";
        echo "<td>" . $row["Null"] . "</td>";
        echo "<td>" . $row["Key"] . "</td>";
        echo "<td>" . $row["Default"] . "</td>";
        echo "<td>" . $row["Extra"] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "0 results";
}

// Close connection
$conn->close();
?>
