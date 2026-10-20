<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, bool $sent = false): never {
    http_response_code($status);
    echo json_encode(['sent' => $sent]);
    exit;
}
final class DriverMailException extends RuntimeException {
    public function __construct(public readonly string $category, public readonly ?int $smtpCode = null) {
        parent::__construct($category);
    }
}
function mailConfig(): array {
    $names = ['host'=>'SMTP_HOST', 'port'=>'SMTP_PORT', 'encryption'=>'SMTP_ENCRYPTION', 'username'=>'SMTP_USER', 'password'=>'SMTP_PASS', 'from'=>'SMTP_FROM', 'to'=>'DRIVER_APPLICATION_TO'];
    $config = [];
    foreach ($names as $key => $name) {
        $value = getenv($name);
        if ($value !== false && $value !== '') $config[$key] = $value;
    }
    $required = ['host', 'port', 'username', 'password', 'from', 'to'];
    if (array_diff($required, array_keys($config))) {
        $webRoot = realpath($_SERVER['DOCUMENT_ROOT'] ?? '') ?: realpath(__DIR__ . '/../..');
        $codeRoot = realpath(__DIR__ . '/../..');
        if ($webRoot === false || $codeRoot === false) throw new DriverMailException('configuration missing');
        $configuredPath = getenv('MAIL_CONFIG_PATH');
        $path = $configuredPath !== false && $configuredPath !== ''
            ? $configuredPath
            : dirname($webRoot) . '/private/mail-config.php';
        if (!str_starts_with($path, '/') || str_contains($path, '://')) throw new DriverMailException('configuration missing');
        $resolved = realpath($path);
        if ($resolved === false || !is_file($resolved) || !is_readable($resolved)) throw new DriverMailException('configuration missing');
        foreach ([$webRoot, $codeRoot] as $root) {
            if ($resolved === $root || str_starts_with($resolved, $root . DIRECTORY_SEPARATOR)) {
                throw new DriverMailException('configuration missing');
            }
        }
        $fileConfig = require $resolved;
        if (!is_array($fileConfig)) throw new DriverMailException('configuration missing');
        foreach ($names as $key => $_) {
            if (!isset($config[$key]) && isset($fileConfig[$key])) $config[$key] = $fileConfig[$key];
        }
    }
    if (!isset($config['encryption'])) {
        $config['encryption'] = (string)($config['port'] ?? '') === '465' ? 'ssl' : 'tls';
    }
    $host = $config['host'] ?? null;
    $port = $config['port'] ?? null;
    $port = filter_var($port, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 65535]]);
    if (!is_string($host) || !preg_match('/^[a-zA-Z0-9.-]+$/D', $host) || !$port
        || !in_array($config['encryption'], ['ssl', 'tls'], true)
        || !is_string($config['username'] ?? null) || trim($config['username']) === ''
        || preg_match('/[\r\n]/', $config['username'])
        || !is_string($config['password'] ?? null) || $config['password'] === ''
        || !is_string($config['from'] ?? null) || !is_string($config['to'] ?? null)
        || !filter_var($config['from'], FILTER_VALIDATE_EMAIL)
        || preg_match('/[\r\n<>]/', $config['from'])
        || $config['to'] !== 'info@velcotiytechniques.ca') {
        throw new DriverMailException('configuration missing');
    }
    $config['port'] = $port;
    return $config;
}
function smtpReply($socket, array $codes, string $category): void {
    do {
        $line = fgets($socket, 1024);
        if ($line === false || !preg_match('/^([0-9]{3})([ -])/', $line, $parts)) {
            throw new DriverMailException($category);
        }
    } while ($parts[2] === '-');
    if (!in_array((int)$parts[1], $codes, true)) {
        throw new DriverMailException($category, (int)$parts[1]);
    }
}
function smtpCommand($socket, string $command, array $codes, string $category): void {
    $wire = $command . "\r\n";
    while ($wire !== '') {
        $written = @fwrite($socket, $wire);
        if ($written === false || $written === 0) throw new DriverMailException($category);
        $wire = substr($wire, $written);
    }
    smtpReply($socket, $codes, $category);
}
function address(string $value): string {
    if (!filter_var($value, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n<>]/', $value)) {
        throw new DriverMailException('configuration missing');
    }
    return $value;
}
function mimeSubject(string $subject): string {
    $chars = preg_split('//u', $subject, -1, PREG_SPLIT_NO_EMPTY);
    if ($chars === false) throw new DriverMailException('SMTP delivery rejected');
    $chunks = [];
    $chunk = '';
    foreach ($chars as $char) {
        if (strlen($chunk . $char) > 45) {
            $chunks[] = '=?UTF-8?B?' . base64_encode($chunk) . '?=';
            $chunk = '';
        }
        $chunk .= $char;
    }
    if ($chunk !== '') $chunks[] = '=?UTF-8?B?' . base64_encode($chunk) . '?=';
    return implode("\r\n ", $chunks);
}
function smtpTarget(array $config): string {
    return ($config['encryption'] === 'ssl' ? 'ssl' : 'tcp') . '://' . $config['host'] . ':' . $config['port'];
}
function smtpRequiresStartTls(array $config): bool {
    return $config['encryption'] === 'tls';
}
function sendMail(array $data): void {
    $config = mailConfig();
    $from = $config['from'];
    $to = $config['to'];
    $socket = @stream_socket_client(smtpTarget($config), $error, $message, 10, STREAM_CLIENT_CONNECT);
    if ($socket === false) throw new DriverMailException('SMTP connection failed');
    stream_set_timeout($socket, 10);
    try {
        smtpReply($socket, [220], 'SMTP connection failed');
        smtpCommand($socket, 'EHLO velcotiytechniques.ca', [250], 'SMTP connection failed');
        if (smtpRequiresStartTls($config)) {
            smtpCommand($socket, 'STARTTLS', [220], 'SMTP connection failed');
            if (!@stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new DriverMailException('SMTP connection failed');
            }
            smtpCommand($socket, 'EHLO velcotiytechniques.ca', [250], 'SMTP connection failed');
        }
        smtpCommand($socket, 'AUTH LOGIN', [334], 'SMTP authentication failed');
        smtpCommand($socket, base64_encode($config['username']), [334], 'SMTP authentication failed');
        smtpCommand($socket, base64_encode($config['password']), [235], 'SMTP authentication failed');
        smtpCommand($socket, 'MAIL FROM:<' . $from . '>', [250], 'SMTP delivery rejected');
        smtpCommand($socket, 'RCPT TO:<' . $to . '>', [250, 251], 'SMTP delivery rejected');
        smtpCommand($socket, 'DATA', [354], 'SMTP delivery rejected');
        $labels = ['name'=>'Full Name','email'=>'Email','phone'=>'Phone','age'=>'Age','city'=>'City','province'=>'Province','workAuthorization'=>'Legally authorized to work in Canada','validLicence'=>'Valid driver’s licence','vehicleType'=>'Vehicle Type','vehicleName'=>'Vehicle Name','weeklyAvailability'=>'Weekly Availability','experience'=>'Delivery Experience','emergencyContact'=>'Emergency Contact','message'=>'Additional Notes'];
        $body = "Driver Application\n\n";
        foreach ($labels as $key => $label) {
            $body .= $label . ': ' . ($data[$key] !== '' ? $data[$key] : 'Not provided') . "\n";
        }
        $body .= "\nSubmitted (UTC): " . gmdate('Y-m-d H:i:s') . "\n";
        $subject = 'New Driver Application — ' . $data['name'];
        $headers = [
            'From: Velcotiy Website <' . $from . '>',
            'To: <' . $to . '>',
            'Reply-To: <' . address($data['email']) . '>',
            'Subject: ' . mimeSubject($subject),
            'Date: ' . gmdate('D, d M Y H:i:s') . ' +0000',
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: base64',
        ];
        $encoded = chunk_split(base64_encode($body), 76, "\r\n");
        $message = implode("\r\n", $headers) . "\r\n\r\n" . $encoded;
        smtpCommand($socket, $message . '.', [250], 'SMTP delivery rejected');
        // The message is accepted after DATA; a QUIT failure must not turn success into an error.
        @fwrite($socket, "QUIT\r\n");
    } finally {
        fclose($socket);
    }
}

function requestStatus(array $server, string $raw): int {
    if (($server['REQUEST_METHOD'] ?? '') !== 'POST') return 405;
    $origin = $server['HTTP_ORIGIN'] ?? '';
    $referer = $server['HTTP_REFERER'] ?? '';
    $allowedOrigins = ['https://velcotiytechniques.ca', 'https://www.velcotiytechniques.ca'];
    if ($origin !== '' && !in_array($origin, $allowedOrigins, true)) return 403;
    if ($origin === '' && $referer !== '') {
        $parts = parse_url($referer);
        $refererOrigin = is_array($parts) && isset($parts['scheme'], $parts['host']) && !isset($parts['port'])
            ? $parts['scheme'] . '://' . $parts['host'] : '';
        if (!in_array($refererOrigin, $allowedOrigins, true)) return 403;
    }
    if (($server['CONTENT_TYPE'] ?? '') !== 'application/json') return 415;
    if ((int)($server['CONTENT_LENGTH'] ?? 0) > 12000 || strlen($raw) > 12000) return 413;
    if (!is_array(json_decode($raw, true))) return 400;
    return 0;
}
function validatedDriverData(array $data): ?array {
    if (!empty($data['website'])) return null;
    $limits = ['name'=>500,'email'=>254,'phone'=>500,'age'=>3,'city'=>500,'province'=>500,'workAuthorization'=>3,'validLicence'=>3,'vehicleType'=>500,'vehicleName'=>500,'weeklyAvailability'=>500,'experience'=>2000,'emergencyContact'=>500,'message'=>2000];
    foreach ($limits as $key => $max) {
        if (!isset($data[$key]) || !is_string($data[$key])) return null;
        $data[$key] = trim($data[$key]);
        if (strlen($data[$key]) > $max || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $data[$key])) return null;
        if (!in_array($key, ['experience','message'], true) && $data[$key] === '') return null;
    }
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL) || !preg_match('/^[0-9]+$/', $data['age']) || (int)$data['age'] < 1 || (int)$data['age'] > 120 || strlen($data['phone']) < 7 || !in_array($data['workAuthorization'], ['Yes','No'], true) || !in_array($data['validLicence'], ['Yes','No'], true) || !in_array($data['vehicleType'], ['EV','Sedan','SUV / Crossover','Compact Cargo','Cargo Van','Large Cargo Van'], true) || !preg_match('/^[1-7] days? per week$/', $data['weeklyAvailability'])) return null;
    return $data;
}
function allowDriverAttempt(string $clientIp, ?string $directory = null, ?int $now = null): bool {
    $path = ($directory ?? sys_get_temp_dir()) . '/velcotiy-driver-' . hash('sha256', $clientIp) . '.lock';
    $handle = fopen($path, 'c+');
    if ($handle === false || !flock($handle, LOCK_EX)) throw new DriverMailException('rate limit unavailable');
    try {
        $now ??= time();
        $lastAttempt = (int)stream_get_contents($handle);
        if ($now - $lastAttempt < 60) return false;
        rewind($handle);
        if (!ftruncate($handle, 0) || fwrite($handle, (string)$now) === false || !fflush($handle)) {
            throw new DriverMailException('rate limit unavailable');
        }
        return true;
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}
if (defined('DRIVER_MAIL_LIBRARY_ONLY')) return;
$raw = file_get_contents('php://input', false, null, 0, 12001);
if ($raw === false) respond(413);
$status = requestStatus($_SERVER, $raw);
if ($status !== 0) {
    if ($status === 405) header('Allow: POST');
    respond($status);
}
$data = validatedDriverData(json_decode($raw, true));
if ($data === null) respond(400);
try {
    if (!allowDriverAttempt($_SERVER['REMOTE_ADDR'] ?? 'unknown')) respond(429);
} catch (Throwable $exception) {
    error_log('driver-mail rate limit unavailable');
    respond(503);
}
try {
    sendMail($data);
    respond(200, true);
} catch (Throwable $exception) {
    $category = $exception instanceof DriverMailException ? $exception->category : 'unexpected failure';
    $code = $exception instanceof DriverMailException ? $exception->smtpCode : null;
    error_log('driver-mail ' . $category . ($code !== null ? ' smtp-code=' . $code : ''));
    respond(503);
}
