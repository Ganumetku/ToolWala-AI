<?php
header('Content-Type: text/plain');

$app_dir = dirname(__DIR__);
$tmp_dir = $app_dir . '/tmp';
$restart_file = $tmp_dir . '/restart.txt';

echo "App Dir: $app_dir\n";

if (!is_dir($tmp_dir)) {
    if (mkdir($tmp_dir, 0755, true)) {
        echo "Created tmp directory.\n";
    } else {
        echo "Failed to create tmp directory.\n";
    }
}

if (touch($restart_file)) {
    echo "Successfully touched tmp/restart.txt!\n";
    echo "Passenger reload triggered. The next request to a Node route will restart the server.\n";
} else {
    echo "Failed to touch tmp/restart.txt\n";
}
?>
