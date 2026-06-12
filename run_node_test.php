<?php
header('Content-Type: text/plain');
echo "Running Node test:\n";
$output = [];
$return_var = 0;
// Run a simple node command to require next and print its version
exec('/home/awyducvp/nodevenv/public_html/toolwala.co/20/bin/node -e "console.log(require(\'next/package.json\').version)" 2>&1', $output, $return_var);
echo "Exit code: $return_var\n";
echo "Output:\n" . implode("\n", $output) . "\n";
unlink(__FILE__);
?>
