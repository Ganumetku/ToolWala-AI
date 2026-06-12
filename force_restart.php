<?php
header('Content-Type: text/plain');
if (!is_dir('tmp')) {
    mkdir('tmp', 0755, true);
}
$file = 'tmp/restart.txt';
if (touch($file)) {
    echo "Successfully touched $file. Passenger/LiteSpeed will restart the application on the next request.\n";
    echo "Current file time: " . date("Y-m-d H:i:s", filemtime($file)) . "\n";
} else {
    echo "Failed to touch $file\n";
}
unlink(__FILE__);
?>
