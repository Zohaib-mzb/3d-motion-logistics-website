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
function smtpReply($socket, array $codes): void {
    do {
        $line = fgets($socket, 1024);
        if ($line === false || !preg_match('/^([0-9]{3})([ -])/', $line, $parts)) {
            throw new RuntimeException('Invalid SMTP response');
        }
    } while ($parts[2] === '-');
    if (!in_array((int)$parts[1], $codes, true)) {
        throw new RuntimeException('SMTP command rejected: ' . $parts[1]);
    }
}
function smtpCommand($socket, string $command, array $codes): void {
    if (fwrite($socket, $command . "\r\n") === false) {
        throw new RuntimeException('SMTP write failed');
    }
    smtpReply($socket, $codes);
}
function address(string $value): string {
    if (!filter_var($value, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n<>]/', $value)) {
        throw new RuntimeException('Invalid configured mail address');
    }
    return $value;
}
function sendMail(array $data): void {
    $host = getenv('SMTP_HOST') ?: '';
    $port = filter_var(getenv('SMTP_PORT') ?: '', FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 65535]]);
    $user = getenv('SMTP_USER') ?: '';
    $pass = getenv('SMTP_PASS') ?: '';
    $from = address(getenv('SMTP_FROM') ?: '');
    $to = address(getenv('DRIVER_APPLICATION_TO') ?: '');
    if ($host === '' || preg_match('/[^a-zA-Z0-9.:-]/', $host) || !$port || $user === '' || $pass === '' || $to !== 'info@velcotiytechniques.ca') {
        throw new RuntimeException('SMTP configuration missing');
    }
    $socket = stream_socket_client("tcp://{$host}:{$port}", $error, $message, 10, STREAM_CLIENT_CONNECT);
    if ($socket === false) {
        throw new RuntimeException('SMTP connection failed');
    }
    stream_set_timeout($socket, 10);
    try {
        smtpReply($socket, [220]);
        smtpCommand($socket, 'EHLO velcotiytechniques.ca', [250]);
        smtpCommand($socket, 'STARTTLS', [220]);
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            throw new RuntimeException('SMTP TLS failed');
        }
        smtpCommand($socket, 'EHLO velcotiytechniques.ca', [250]);
        smtpCommand($socket, 'AUTH LOGIN', [334]);
        smtpCommand($socket, base64_encode($user), [334]);
        smtpCommand($socket, base64_encode($pass), [235]);
        smtpCommand($socket, 'MAIL FROM:<' . $from . '>', [250]);
        smtpCommand($socket, 'RCPT TO:<' . $to . '>', [250, 251]);
        smtpCommand($socket, 'DATA', [354]);
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
            'Subject: =?UTF-8?B?' . base64_encode($subject) . '?=',
            'Date: ' . gmdate('D, d M Y H:i:s') . ' +0000',
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: base64',
        ];
        $encoded = chunk_split(base64_encode($body), 76, "\r\n");
        $message = implode("\r\n", $headers) . "\r\n\r\n" . $encoded;
        smtpCommand($socket, $message . '.', [250]);
        smtpCommand($socket, 'QUIT', [221]);
    } finally {
        fclose($socket);
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405);
}
if (($_SERVER['CONTENT_TYPE'] ?? '') !== 'application/json') respond(415);
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 12000) respond(413);
$raw = file_get_contents('php://input', false, null, 0, 12001);
if ($raw === false || strlen($raw) > 12000) respond(413);
$data = json_decode($raw, true);
if (!is_array($data)) respond(400);
if (!empty($data['website'])) respond(400);
$limits = ['name'=>500,'email'=>254,'phone'=>500,'age'=>3,'city'=>500,'province'=>500,'workAuthorization'=>3,'validLicence'=>3,'vehicleType'=>500,'vehicleName'=>500,'weeklyAvailability'=>500,'experience'=>2000,'emergencyContact'=>500,'message'=>2000];
foreach ($limits as $key => $max) {
    if (!isset($data[$key]) || !is_string($data[$key])) respond(400);
    $data[$key] = trim($data[$key]);
    if (strlen($data[$key]) > $max || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $data[$key])) respond(400);
    if (!in_array($key, ['experience','message'], true) && $data[$key] === '') respond(400);
}
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL) || !preg_match('/^[0-9]+$/', $data['age']) || (int)$data['age'] < 1 || (int)$data['age'] > 120 || strlen($data['phone']) < 7 || !in_array($data['workAuthorization'], ['Yes','No'], true) || !in_array($data['validLicence'], ['Yes','No'], true) || !in_array($data['vehicleType'], ['EV','Sedan','SUV / Crossover','Compact Cargo','Cargo Van','Large Cargo Van'], true) || !preg_match('/^[1-7] days? per week$/', $data['weeklyAvailability'])) respond(400);
$clientIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$throttlePath = sys_get_temp_dir() . '/velcotiy-driver-' . hash('sha256', $clientIp) . '.lock';
$throttle = fopen($throttlePath, 'c+');
if ($throttle === false || !flock($throttle, LOCK_EX)) respond(503);
$lastAttempt = (int)stream_get_contents($throttle);
if (time() - $lastAttempt < 60) {
    flock($throttle, LOCK_UN);
    fclose($throttle);
    respond(429);
}
rewind($throttle);
ftruncate($throttle, 0);
fwrite($throttle, (string)time());
fflush($throttle);
flock($throttle, LOCK_UN);
fclose($throttle);
try {
    sendMail($data);
    respond(200, true);
} catch (Throwable $exception) {
    error_log('Driver application SMTP delivery failed');
    respond(503);
}
