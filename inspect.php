<?php
header('Content-Type: text/plain');
echo "Node modules exists: " . (is_dir('node_modules') ? 'YES' : 'NO') . "\n";
echo "Package.json exists: " . (file_exists('package.json') ? 'YES' : 'NO') . "\n";
echo "Server.js exists: " . (file_exists('server.js') ? 'YES' : 'NO') . "\n";
echo "App.js exists: " . (file_exists('app.js') ? 'YES' : 'NO') . "\n";
echo ".next exists: " . (is_dir('.next') ? 'YES' : 'NO') . "\n";

if (file_exists('stderr.log')) {
    echo "--- stderr.log (last 20 lines) ---\n";
    echo file_get_contents('stderr.log');
} else {
    echo "stderr.log does not exist\n";
}

// Find any error log files in the directory
foreach (glob("*.log") as $filename) {
    echo "--- $filename ---\n";
    echo file_get_contents($filename);
}

unlink(__FILE__);
?>
