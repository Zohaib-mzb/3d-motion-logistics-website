<?php
declare(strict_types=1);

// Run with: php server/tests/driver-mail.php
// Uses placeholder credentials and a mocked provider. No email is sent.
define('DRIVER_MAIL_LIBRARY_ONLY', true);
require dirname(__DIR__, 2) . '/public/api/driver-application.php';

function check(bool $condition, string $case): void {
    if (!$condition) throw new RuntimeException('Failed: ' . $case);
    echo "PASS: {$case}\n";
}
function failsWith(callable $action, string $category): bool {
    try { $action(); return false; }
    catch (DriverMailException $error) { return $error->category === $category; }
}
putenv('RESEND_API_KEY');
putenv('MAIL_CONFIG_PATH');
$tempRoot = is_dir(sys_get_temp_dir()) ? sys_get_temp_dir() : '/tmp';
$base = $tempRoot . '/velcotiy-mail-test-' . bin2hex(random_bytes(6));
mkdir($base);
mkdir($base . '/public_html');
mkdir($base . '/private');
$_SERVER['DOCUMENT_ROOT'] = $base . '/public_html';
$privatePath = $base . '/private/mail-config.php';
$publicPath = $base . '/public_html/mail-config.php';
$configText = <<<'CONFIG'
<?php
return ['provider'=>'resend','api_key'=>'placeholder-api-key','sender_email'=>'info@velcotiytechniques.ca','sender_name'=>'Velcotiy Website','recipient_email'=>'info@velcotiytechniques.ca'];
CONFIG;
try {
    check(failsWith('resendApiKey', 'provider_configuration_missing'), 'missing configuration rejected');
    file_put_contents($privatePath, $configText);
    check(resendApiKey() === 'placeholder-api-key', 'private config fallback');
    putenv('MAIL_CONFIG_PATH=' . $publicPath);
    file_put_contents($publicPath, $configText);
    check(failsWith('resendApiKey', 'provider_configuration_missing'), 'public config path rejected');
    putenv('MAIL_CONFIG_PATH');
    putenv('RESEND_API_KEY=environment-test-key');
    check(resendApiKey() === 'environment-test-key', 'environment key takes precedence');
    putenv('RESEND_API_KEY');
    file_put_contents($privatePath, "<?php return ['provider'=>'resend','api_key'=>'bad key'];");
    check(failsWith('resendApiKey', 'provider_configuration_missing'), 'invalid API key rejected');
    file_put_contents($privatePath, $configText);

    $server = ['REQUEST_METHOD'=>'POST','CONTENT_TYPE'=>'application/json','HTTP_ORIGIN'=>'https://velcotiytechniques.ca'];
    check(requestStatus(['REQUEST_METHOD'=>'GET'], '') === 405, 'GET rejected');
    check(requestStatus(['REQUEST_METHOD'=>'POST','CONTENT_TYPE'=>'text/plain'], '{}') === 415, 'content type rejected');
    check(requestStatus($server, '{') === 400, 'malformed JSON rejected');
    check(requestStatus($server, str_repeat('x', 12001)) === 413, 'oversized body rejected');
    check(requestStatus($server + ['CONTENT_LENGTH'=>'12001'], '{}') === 413, 'oversized content length rejected');
    check(requestStatus(['REQUEST_METHOD'=>'POST','CONTENT_TYPE'=>'application/json','HTTP_ORIGIN'=>'https://evil.example'], '{}') === 403, 'foreign Origin rejected');
    check(requestStatus($server, '{}') === 0, 'valid request framing');
    $data = ['name'=>'Test Driver','email'=>'driver@example.com','phone'=>'1234567','age'=>'35','city'=>'Toronto','province'=>'Ontario','workAuthorization'=>'Yes','validLicence'=>'Yes','vehicleType'=>'Sedan','vehicleName'=>'Example Car','weeklyAvailability'=>'3 days per week','experience'=>'','emergencyContact'=>'Example 1234567','message'=>'','website'=>''];
    check(validatedDriverData($data) !== null, 'valid driver data accepted');
    foreach (['name'=>'','email'=>'bad','age'=>'200','vehicleType'=>'Bike','weeklyAvailability'=>'never','website'=>'bot'] as $field => $value) {
        $invalid = $data;
        $invalid[$field] = $value;
        check(validatedDriverData($invalid) === null, $field . ' validation');
    }
    $invalid = $data;
    unset($invalid['phone']);
    check(validatedDriverData($invalid) === null, 'missing field rejected');
    $invalid = $data;
    $invalid['message'] = str_repeat('a', 2001);
    check(validatedDriverData($invalid) === null, 'field limit enforced');
    check(allowDriverAttempt('test-client', $base, 1000), 'first attempt allowed');
    check(!allowDriverAttempt('test-client', $base, 1001), 'rate limit rejects repeat');
    check(allowDriverAttempt('test-client', $base, 1060), 'rate limit expires');

    putenv('RESEND_API_KEY=environment-test-key');
    $captured = [];
    $accepted = function (string $url, string $key, array $payload) use (&$captured): array {
        $captured = [$url, $key, $payload];
        return [201, '{"id":"accepted-id"}'];
    };
    sendMail($data, $accepted);
    check($captured[0] === 'https://api.resend.com/emails' && $captured[1] === 'environment-test-key', 'Resend URL and server key used');
    check($captured[2]['from'] === 'Velcotiy Website <info@velcotiytechniques.ca>' && $captured[2]['to'] === ['info@velcotiytechniques.ca'], 'fixed sender and recipient');
    check($captured[2]['reply_to'] === 'driver@example.com' && strpos($captured[2]['text'], 'Not provided') !== false, 'reply-to and optional fields');
    check(strpos($captured[2]['text'], 'Vehicle Year') === false && strpos($captured[2]['text'], 'Submitted (UTC):') !== false, 'body fields and timestamp');
    check(resendResponseError(200, '{"id":"accepted"}') === null, '200 with id accepted');
    check(resendResponseError(201, '{"id":"accepted"}') === null, '201 with id accepted');
    foreach ([401=>'provider_authentication_failed',403=>'provider_authentication_failed',400=>'provider_rejected',422=>'provider_rejected',429=>'rate_limited',500=>'provider_connection_failed'] as $status => $expected) {
        $mock = function () use ($status): array { return [$status, '{}']; };
        check(failsWith(function () use ($data, $mock): void { sendMail($data, $mock); }, $expected), 'provider ' . $status . ' mapped safely');
    }
    check(resendResponseError(201, '{}') === 'unexpected_failure', '201 without id rejected');
    check(resendResponseError(200, '{"id":"   "}') === 'unexpected_failure', 'blank id rejected');
    check(resendResponseError(204, '') === 'unexpected_failure', 'unexpected status rejected');
    $timeout = function (): array { throw new DriverMailException('provider_connection_failed'); };
    check(failsWith(function () use ($data, $timeout): void { sendMail($data, $timeout); }, 'provider_connection_failed'), 'network timeout mapped safely');
    check(publicErrorCode(new RuntimeException('private detail')) === 'unexpected_failure', 'unexpected error masked');
} finally {
    putenv('RESEND_API_KEY');
    putenv('MAIL_CONFIG_PATH');
    @unlink($base . '/velcotiy-driver-' . hash('sha256', 'test-client') . '.lock');
    @unlink($privatePath);
    @unlink($publicPath);
    @rmdir($base . '/private');
    @rmdir($base . '/public_html');
    @rmdir($base);
}
