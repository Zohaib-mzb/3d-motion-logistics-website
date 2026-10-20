<?php
declare(strict_types=1);

// Run with: php server/tests/driver-mail.php
// Uses only placeholder credentials and does not connect to an SMTP server.
define('DRIVER_MAIL_LIBRARY_ONLY', true);
require dirname(__DIR__, 2) . '/public/api/driver-application.php';

function check(bool $condition, string $case): void {
    if (!$condition) throw new RuntimeException('Failed: ' . $case);
    echo "PASS: {$case}\n";
}
function failsConfig(): bool {
    try { mailConfig(); return false; }
    catch (DriverMailException $error) { return $error->category === 'configuration missing'; }
}
$vars = ['SMTP_HOST','SMTP_PORT','SMTP_ENCRYPTION','SMTP_USER','SMTP_PASS','SMTP_FROM','DRIVER_APPLICATION_TO','MAIL_CONFIG_PATH'];
foreach ($vars as $var) putenv($var);
$base = sys_get_temp_dir() . '/velcotiy-mail-test-' . bin2hex(random_bytes(6));
mkdir($base);
mkdir($base . '/public_html');
mkdir($base . '/private');
$_SERVER['DOCUMENT_ROOT'] = $base . '/public_html';
$privatePath = $base . '/private/mail-config.php';
$publicPath = $base . '/public_html/mail-config.php';
$configText = <<<'CONFIG'
<?php
return ['host'=>'smtp.hostinger.com','port'=>465,'encryption'=>'ssl','username'=>'sender@example.com','password'=>'example-only','from'=>'sender@example.com','to'=>'info@velcotiytechniques.ca'];
CONFIG;
try {
    check(failsConfig(), 'missing configuration fails safely');
    file_put_contents($privatePath, $configText);
    $private = mailConfig();
    check($private['host'] === 'smtp.hostinger.com' && $private['encryption'] === 'ssl', 'private config fallback');
    check(smtpTarget($private) === 'ssl://smtp.hostinger.com:465' && !smtpRequiresStartTls($private), 'SSL 465 without STARTTLS');
    check(!str_contains(mimeSubject('New Driver Application — Zoë Driver'), "\n"), 'safe encoded subject');

    putenv('MAIL_CONFIG_PATH=' . $publicPath);
    file_put_contents($publicPath, $configText);
    check(failsConfig(), 'public web-root config rejected');
    putenv('MAIL_CONFIG_PATH');

    putenv('SMTP_HOST=mail.example.com');
    putenv('SMTP_PORT=587');
    putenv('SMTP_ENCRYPTION=tls');
    putenv('SMTP_USER=sender@example.com');
    putenv('SMTP_PASS=example-only');
    putenv('SMTP_FROM=sender@example.com');
    putenv('DRIVER_APPLICATION_TO=info@velcotiytechniques.ca');
    $environment = mailConfig();
    check($environment['host'] === 'mail.example.com', 'complete environment takes precedence');
    check(smtpTarget($environment) === 'tcp://mail.example.com:587' && smtpRequiresStartTls($environment), 'TLS 587 with STARTTLS');
    putenv('SMTP_ENCRYPTION');
    check(mailConfig()['encryption'] === 'tls', '587 infers STARTTLS');

    $server = ['REQUEST_METHOD'=>'POST','CONTENT_TYPE'=>'application/json','HTTP_ORIGIN'=>'https://velcotiytechniques.ca'];
    check(requestStatus(['REQUEST_METHOD'=>'GET'], '') === 405, 'GET rejected');
    check(requestStatus(['REQUEST_METHOD'=>'POST','CONTENT_TYPE'=>'text/plain'], '{}') === 415, 'content type rejected');
    check(requestStatus($server, '{') === 400, 'malformed JSON rejected');
    check(requestStatus($server, str_repeat('x', 12001)) === 413, 'oversized body rejected');
    check(requestStatus($server + ['CONTENT_LENGTH'=>'12001'], '{}') === 413, 'oversized content length rejected');
    check(requestStatus($server, '{}') === 0, 'valid request framing');
    check(requestStatus($server + ['HTTP_REFERER'=>'https://evil.example/'], '{}') === 0, 'allowed Origin takes precedence over Referer');
    check(requestStatus(['REQUEST_METHOD'=>'POST','CONTENT_TYPE'=>'application/json','HTTP_ORIGIN'=>'https://evil.example'], '{}') === 403, 'foreign Origin rejected');
    check(requestStatus(['REQUEST_METHOD'=>'POST','CONTENT_TYPE'=>'application/json','HTTP_REFERER'=>'https://evil.example/'], '{}') === 403, 'foreign Referer rejected');
    check(requestStatus(['REQUEST_METHOD'=>'POST','CONTENT_TYPE'=>'application/json'], '{}') === 0, 'missing Origin and Referer allowed');

    $data = ['name'=>'Test Driver','email'=>'driver@example.com','phone'=>'1234567','age'=>'35','city'=>'Toronto','province'=>'Ontario','workAuthorization'=>'Yes','validLicence'=>'Yes','vehicleType'=>'Sedan','vehicleName'=>'Example Car','weeklyAvailability'=>'3 days per week','experience'=>'','emergencyContact'=>'Example 1234567','message'=>'','website'=>''];
    check(validatedDriverData($data) !== null, 'valid driver data accepted');
    foreach (['name','email','age','weeklyAvailability','website'] as $field) {
        $invalid = $data;
        $invalid[$field] = match ($field) { 'name'=>'', 'email'=>'bad', 'age'=>'200', 'weeklyAvailability'=>'never', 'website'=>'bot' };
        check(validatedDriverData($invalid) === null, $field . ' validation');
    }
    $invalid = $data;
    unset($invalid['phone']);
    check(validatedDriverData($invalid) === null, 'missing required field rejected');
    $invalid = $data;
    $invalid['name'] = "Bad\x00Name";
    check(validatedDriverData($invalid) === null, 'control character rejected');
    $invalid = $data;
    $invalid['message'] = str_repeat('a', 2001);
    check(validatedDriverData($invalid) === null, 'field limit enforced');
    check(allowDriverAttempt('test-client', $base, 1000), 'first attempt allowed');
    check(!allowDriverAttempt('test-client', $base, 1001), 'rate limit rejects repeat');
    check(allowDriverAttempt('test-client', $base, 1060), 'rate limit expires');
} finally {
    foreach ($vars as $var) putenv($var);
    @unlink($base . '/velcotiy-driver-' . hash('sha256', 'test-client') . '.lock');
    @unlink($privatePath);
    @unlink($publicPath);
    @rmdir($base . '/private');
    @rmdir($base . '/public_html');
    @rmdir($base);
}
