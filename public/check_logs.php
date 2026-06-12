<?php
header('Content-Type: text/plain');
$log = '/home/awyducvp/public_html/toolwala.co/stderr.log';
if (file_exists($log)) {
    echo "=== LAST 100 LINES OF STDERR.LOG ===\n";
    $lines = file($log);
    $last_lines = array_slice($lines, -100);
    echo implode('', $last_lines);
} else {
    echo "Log file not found: $log\n";
}
?>
