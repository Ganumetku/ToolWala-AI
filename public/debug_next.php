<?php
header('Content-Type: text/plain');

$app_dir = dirname(__DIR__);
$node_modules = $app_dir . '/node_modules';
$next_dir = $node_modules . '/next';

echo "App Dir: $app_dir\n";
echo "Node Modules: $node_modules (Exists: " . (is_dir($node_modules) ? 'YES' : 'NO') . ")\n";
echo "Next Dir: $next_dir (Exists: " . (is_dir($next_dir) ? 'YES' : 'NO') . ")\n";

if (is_dir($next_dir)) {
    $pj = $next_dir . '/package.json';
    echo "Next package.json Exists: " . (file_exists($pj) ? 'YES' : 'NO') . "\n";
    if (file_exists($pj)) {
        $content = json_decode(file_get_contents($pj), true);
        echo "Next Version: " . ($content['version'] ?? 'UNKNOWN') . "\n";
        echo "Next Main: " . ($content['main'] ?? 'UNKNOWN') . "\n";
    }
    
    // Check if dist/server/next-server.js exists (core next.js server)
    $server_js = $next_dir . '/dist/server/next-server.js';
    echo "Next Server JS Exists: " . (file_exists($server_js) ? 'YES' : 'NO') . "\n";
}

// Count total items in node_modules
if (is_dir($node_modules)) {
    $files = scandir($node_modules);
    echo "Total files/folders in node_modules: " . count($files) . "\n";
}
?>
