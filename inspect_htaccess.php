<?php
header('Content-Type: text/plain');
echo "File list:\n";
foreach (scandir('.') as $file) {
    if ($file != '.' && $file != '..') {
        echo " - $file " . (is_dir($file) ? '[DIR]' : '[FILE] (' . filesize($file) . ' bytes)') . "\n";
    }
}
echo "\n.htaccess contents:\n";
if (file_exists('.htaccess')) {
    echo file_get_contents('.htaccess');
} else {
    echo ".htaccess does not exist!\n";
}
unlink(__FILE__);
?>
