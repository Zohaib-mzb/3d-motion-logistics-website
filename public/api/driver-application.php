<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, bool $sent = false, ?string $errorCode = null): void {
    http_response_code($status);
    $body = ['sent' => $sent];
    $safeCodes = ['invalid_request', 'validation_failed', 'rate_limited', 'rate_limit_unavailable', 'provider_configuration_missing', 'provider_connection_failed', 'provider_authentication_failed', 'provider_rejected', 'unexpected_failure'];
    if (!$sent && $errorCode !== null) {
        $body['error'] = in_array($errorCode, $safeCodes, true) ? $errorCode : 'unexpected_failure';
    }
    echo json_encode($body);
    exit;
}
final class DriverMailException extends RuntimeException {
    public $category;
    public $providerStatus;
    public function __construct(string $category, ?int $providerStatus = null) {
        parent::__construct($category);
        $this->category = $category;
        $this->providerStatus = $providerStatus;
    }
}
function publicErrorCode(Throwable $exception): string {
    if (!$exception instanceof DriverMailException) return 'unexpected_failure';
    $allowed = ['rate_limit_unavailable', 'provider_configuration_missing', 'provider_connection_failed', 'provider_authentication_failed', 'provider_rejected'];
    return in_array($exception->category, $allowed, true) ? $exception->category : 'unexpected_failure';
}
function brevoApiKey(): string {
    $key = getenv('BREVO_API_KEY');
    if ($key === false || $key === '') {
        $webRoot = realpath($_SERVER['DOCUMENT_ROOT'] ?? '') ?: realpath(__DIR__ . '/../..');
        $codeRoot = realpath(__DIR__ . '/../..');
        if ($webRoot === false || $codeRoot === false) throw new DriverMailException('provider_configuration_missing');
        $configuredPath = getenv('MAIL_CONFIG_PATH');
        $path = $configuredPath !== false && $configuredPath !== ''
            ? $configuredPath
            : dirname($webRoot) . '/private/mail-config.php';
        if (substr($path, 0, 1) !== '/' || strpos($path, '://') !== false) throw new DriverMailException('provider_configuration_missing');
        $resolved = realpath($path);
        if ($resolved === false || !is_file($resolved) || !is_readable($resolved)) throw new DriverMailException('provider_configuration_missing');
        foreach ([$webRoot, $codeRoot] as $root) {
            if ($resolved === $root || strpos($resolved, $root . DIRECTORY_SEPARATOR) === 0) {
                throw new DriverMailException('provider_configuration_missing');
            }
        }
        $config = require $resolved;
        if (!is_array($config) || ($config['provider'] ?? null) !== 'brevo'
            || (isset($config['sender_email']) && $config['sender_email'] !== 'info@velcotiytechniques.ca')
            || (isset($config['recipient_email']) && $config['recipient_email'] !== 'info@velcotiytechniques.ca')
            || (isset($config['sender_name']) && $config['sender_name'] !== 'Velcotiy Website')) {
            throw new DriverMailException('provider_configuration_missing');
        }
        $key = $config['api_key'] ?? null;
    }
    if (!is_string($key) || !preg_match('/^[!-~]{1,512}$/D', $key)) {
        throw new DriverMailException('provider_configuration_missing');
    }
    return $key;
}
function driverEmailPayload(array $data): array {
    $labels = ['name'=>'Full Name','email'=>'Email','phone'=>'Phone','age'=>'Age','city'=>'City','province'=>'Province','workAuthorization'=>'Legally authorized to work in Canada','validLicence'=>'Valid driver’s licence','vehicleType'=>'Vehicle Type','vehicleName'=>'Vehicle Name','weeklyAvailability'=>'Weekly Availability','experience'=>'Delivery Experience','emergencyContact'=>'Emergency Contact','message'=>'Additional Notes'];
    $body = "Driver Application\n\n";
    foreach ($labels as $key => $label) {
        $body .= $label . ': ' . ($data[$key] !== '' ? $data[$key] : 'Not provided') . "\n";
    }
    $body .= "\nSubmitted (UTC): " . gmdate('Y-m-d H:i:s') . "\n";
    return [
        'sender' => ['email' => 'info@velcotiytechniques.ca', 'name' => 'Velcotiy Website'],
        'to' => [['email' => 'info@velcotiytechniques.ca']],
        'replyTo' => ['email' => $data['email']],
        'subject' => 'New Driver Application — ' . str_replace(["\r", "\n"], ' ', $data['name']),
        'textContent' => $body,
    ];
}
function brevoPost(string $url, string $apiKey, array $payload): array {
    if (!function_exists('curl_init')) throw new DriverMailException('provider_connection_failed');
    $handle = curl_init($url);
    if ($handle === false) throw new DriverMailException('provider_connection_failed');
    try {
        $json = json_encode($payload, JSON_THROW_ON_ERROR);
        $configured = curl_setopt_array($handle, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $json,
            CURLOPT_HTTPHEADER => ['api-key: ' . $apiKey, 'Content-Type: application/json', 'Accept: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 4,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);
        if (!$configured) throw new DriverMailException('provider_connection_failed');
        $response = curl_exec($handle);
        $status = (int)curl_getinfo($handle, CURLINFO_HTTP_CODE);
        if ($response === false) throw new DriverMailException('provider_connection_failed');
        return [$status, $response];
    } finally {
        curl_close($handle);
    }
}
function brevoResponseError(int $status, string $response): ?string {
    if ($status === 201) {
        $decoded = json_decode($response, true);
        if (is_array($decoded) && isset($decoded['messageId']) && is_string($decoded['messageId']) && trim($decoded['messageId']) !== '') return null;
        return 'provider_rejected';
    }
    if ($status === 401 || $status === 403) return 'provider_authentication_failed';
    if ($status === 0 || $status >= 500) return 'provider_connection_failed';
    return 'provider_rejected';
}
function sendMail(array $data, ?callable $transport = null): void {
    $apiKey = brevoApiKey();
    $post = $transport ?? 'brevoPost';
    [$status, $response] = $post('https://api.brevo.com/v3/smtp/email', $apiKey, driverEmailPayload($data));
    $error = brevoResponseError($status, $response);
    if ($error !== null) throw new DriverMailException($error, $status);
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
    if ($handle === false || !flock($handle, LOCK_EX)) throw new DriverMailException('rate_limit_unavailable');
    try {
        $now = $now ?? time();
        $lastAttempt = (int)stream_get_contents($handle);
        if ($now - $lastAttempt < 60) return false;
        rewind($handle);
        if (!ftruncate($handle, 0) || fwrite($handle, (string)$now) === false || !fflush($handle)) {
            throw new DriverMailException('rate_limit_unavailable');
        }
        return true;
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}
if (defined('DRIVER_MAIL_LIBRARY_ONLY')) return;
$raw = file_get_contents('php://input', false, null, 0, 12001);
if ($raw === false) respond(413, false, 'invalid_request');
$status = requestStatus($_SERVER, $raw);
if ($status !== 0) {
    if ($status === 405) header('Allow: POST');
    respond($status, false, 'invalid_request');
}
$data = validatedDriverData(json_decode($raw, true));
if ($data === null) respond(400, false, 'validation_failed');
try {
    if (!allowDriverAttempt($_SERVER['REMOTE_ADDR'] ?? 'unknown')) respond(429, false, 'rate_limited');
    sendMail($data);
    respond(200, true);
} catch (Throwable $exception) {
    $error = publicErrorCode($exception);
    $status = $exception instanceof DriverMailException ? $exception->providerStatus : null;
    error_log('driver-mail ' . $error . ($status !== null ? ' provider-status=' . $status : ''));
    respond(503, false, $error);
}
