<?php
header('Content-Type: text/plain');

function check_path($path) {
    if (!file_exists($path)) {
        echo "$path DOES NOT EXIST\n";
        return;
    }
    $perms = fileperms($path);
    $info = '';
    if (($perms & 0xC000) == 0xC000) { $info = 's'; }
    elseif (($perms & 0xA000) == 0xA000) { $info = 'l'; }
    elseif (($perms & 0x8000) == 0x8000) { $info = '-'; }
    elseif (($perms & 0x6000) == 0x6000) { $info = 'b'; }
    elseif (($perms & 0x4000) == 0x4000) { $info = 'd'; }
    elseif (($perms & 0x2000) == 0x2000) { $info = 'c'; }
    elseif (($perms & 0x1000) == 0x1000) { $info = 'p'; }
    else { $info = 'u'; }
    
    // Owner
    $info .= (($perms & 0x0100) ? 'r' : '-');
    $info .= (($perms & 0x0080) ? 'w' : '-');
    $info .= (($perms & 0x0040) ? (($perms & 0x0800) ? 's' : 'x' ) : (($perms & 0x0800) ? 'S' : '-'));
    
    // Group
    $info .= (($perms & 0x0020) ? 'r' : '-');
    $info .= (($perms & 0x0010) ? 'w' : '-');
    $info .= (($perms & 0x0008) ? (($perms & 0x0400) ? 's' : 'x' ) : (($perms & 0x0400) ? 'S' : '-'));
    
    // World
    $info .= (($perms & 0x0004) ? 'r' : '-');
    $info .= (($perms & 0x0002) ? 'w' : '-');
    $info .= (($perms & 0x0001) ? (($perms & 0x0200) ? 't' : 'x' ) : (($perms & 0x0200) ? 'T' : '-'));
    
    $owner = posix_getpwuid(fileowner($path));
    $group = posix_getgrgid(filegroup($path));
    
    echo "$path: perms=$info owner=" . $owner['name'] . " group=" . $group['name'] . " readable=" . (is_readable($path) ? 'YES' : 'NO') . "\n";
}

check_path('node_modules');
check_path('node_modules/next');
check_path('node_modules/next/package.json');
check_path('server.js');

echo "\nPHP running as user: " . posix_getpwuid(posix_geteuid())['name'] . "\n";

unlink(__FILE__);
?>
