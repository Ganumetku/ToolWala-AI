<?php
header('Content-Type: text/plain');

echo "=== ENVIRONMENT VARIABLES CHECK ===\n";
$env_vars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL',
    'ADMIN_EMAIL',
    'NODE_ENV',
    'PORT'
];

foreach ($env_vars as $var) {
    $val = getenv($var);
    if ($val === false) {
        // Also check $_ENV and $_SERVER
        $val = $_ENV[$var] ?? ($_SERVER[$var] ?? null);
    }
    
    if ($val) {
        $len = strlen($val);
        $masked = substr($val, 0, min(4, $len)) . '...' . substr($val, max(0, $len - 4));
        echo "$var: SET (Length: $len, Value: $masked)\n";
    } else {
        echo "$var: NOT SET / EMPTY\n";
    }
}

echo "\n=== HTACCESS CONTENT ===\n";
$htaccess_path = dirname(__DIR__) . '/.htaccess';
if (file_exists($htaccess_path)) {
    echo file_get_contents($htaccess_path);
} else {
    echo ".htaccess not found at: $htaccess_path\n";
}

echo "\n=== STDERR LOG FILE ===\n";
// Let's check for Passenger/Node.js log files
$log_files = [
    dirname(__DIR__) . '/stderr.log',
    '/home/awyducvp/logs/php.error.log',
];

foreach ($log_files as $lf) {
    if (file_exists($lf)) {
        echo "\nLog: $lf\n";
        // Show last 30 lines
        $lines = file($lf);
        $last_lines = array_slice($lines, -30);
        echo implode('', $last_lines);
    } else {
        echo "Log not found: $lf\n";
    }
}
?>
