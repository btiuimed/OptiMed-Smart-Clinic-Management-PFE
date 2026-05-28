<?php
$link = mysqli_connect("localhost", "root", "");
$res = mysqli_query($link, "SHOW DATABASES");

echo "<h3>Your Actual Databases:</h3>";
while ($row = mysqli_fetch_assoc($res)) {
    echo "-> " . $row['Database'] . "<br>";
}
?>
