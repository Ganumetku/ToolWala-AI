<?php
header('Content-Type: text/plain');

function check_path($path) {
    if (!file_exists($path)) {
        echo "$path DOES NOT EXIST\n";
        return;
    }
    $perms = fileperms($path);
    echo "$path perms: " . sprintf('%o', $perms) . " readable: " . (is_readable($path) ? 'YES' : 'NO') . "\n";
}

check_path('node_modules');
check_path('node_modules/next');
check_path('node_modules/next/package.json');
check_path('server.js');

unlink(__FILE__);
?>
