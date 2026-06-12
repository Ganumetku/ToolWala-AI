<?php
header('Content-Type: text/plain');
if (file_exists('stderr.log')) {
    if (unlink('stderr.log')) {
        echo "Successfully deleted stderr.log\n";
    } else {
        echo "Failed to delete stderr.log\n";
    }
} else {
    echo "stderr.log does not exist on the server.\n";
}
unlink(__FILE__);
?>
