<?php
header('Content-Type: text/plain');
echo "Running processes for user:\n";
$output = [];
exec('ps aux 2>&1', $output);
foreach ($output as $line) {
    if (strpos($line, posix_getpwuid(posix_geteuid())['name']) !== false || strpos($line, 'node') !== false) {
        echo " - $line\n";
    }
}
unlink(__FILE__);
?>
