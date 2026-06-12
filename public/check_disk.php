<?php
header('Content-Type: text/plain');

$dir = dirname(__DIR__);
$free = disk_free_space($dir);
$total = disk_total_space($dir);

echo "Disk Free Space: " . ($free !== false ? number_format($free / (1024 * 1024 * 1024), 2) . " GB" : "FAILED") . "\n";
echo "Disk Total Space: " . ($total !== false ? number_format($total / (1024 * 1024 * 1024), 2) . " GB" : "FAILED") . "\n";
echo "Disk Usage %: " . (($free !== false && $total !== false) ? number_format((($total - $free) / $total) * 100, 2) . "%" : "FAILED") . "\n";
?>
