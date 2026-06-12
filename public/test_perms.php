<?php
header('Content-Type: text/plain');

$pj = dirname(__DIR__) . '/node_modules/next/package.json';
echo "File path: $pj\n";

if (file_exists($pj)) {
    echo "File exists.\n";
    echo "Is readable: " . (is_readable($pj) ? "YES" : "NO") . "\n";
    echo "Is writable: " . (is_writable($pj) ? "YES" : "NO") . "\n";
    
    $perms = fileperms($pj);
    printf("Permissions: %o\n", $perms);
    
    $owner_id = fileowner($pj);
    $group_id = filegroup($pj);
    echo "Owner ID: $owner_id, Group ID: $group_id\n";
    
    // Attempt to read just the first 10 characters
    echo "Testing partial read: ";
    $fp = fopen($pj, 'r');
    if ($fp) {
        $chunk = fread($fp, 20);
        echo "SUCCESS (Content: $chunk)\n";
        fclose($fp);
    } else {
        echo "FAILED to open file pointer\n";
    }
} else {
    echo "File does not exist.\n";
}
?>
