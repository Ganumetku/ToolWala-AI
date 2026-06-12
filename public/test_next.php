<?php
header('Content-Type: text/plain');

$target = dirname(__DIR__) . '/node_modules/next';
echo "Target path: $target\n";

try {
    if (file_exists($target)) {
        echo "next directory exists (via file_exists)!\n";
        if (is_dir($target)) {
            echo "next is a directory!\n";
            $pj = $target . '/package.json';
            if (file_exists($pj)) {
                echo "package.json exists!\n";
                $data = file_get_contents($pj);
                echo "package.json size: " . strlen($data) . " bytes\n";
                $json = json_decode($data, true);
                echo "Version: " . ($json['version'] ?? 'unknown') . "\n";
            } else {
                echo "package.json DOES NOT exist inside next!\n";
            }
        } else {
            echo "next is NOT a directory!\n";
        }
    } else {
        echo "next directory DOES NOT exist (via file_exists)!\n";
    }
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
?>
