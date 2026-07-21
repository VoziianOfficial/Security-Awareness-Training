<?php











declare(strict_types=1);

const DEFAULT_CONTACT_TO_LOCAL_PART = 'hello';
const DEFAULT_CONTACT_FROM_LOCAL_PART = 'website';
const DEFAULT_CONTACT_FROM_NAME = 'SecureHabit Website';

const MAX_REQUEST_BYTES = 65536;
const RATE_LIMIT_MAX_SUBMISSIONS = 5;
const RATE_LIMIT_WINDOW_SECONDS = 900;
const MIN_FORM_SECONDS = 2;
const MAX_FORM_AGE_SECONDS = 86400;

const CONTACT_PAGE = 'contact.html#contact-form';
const RESULT_PAGE = 'contact.php';

sendSecurityHeaders();
startContactSession();

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method === 'GET') {
    handleResultPage();
}

if ($method !== 'POST') {
    header('Allow: POST');

    respondWithError(
        'Method not allowed',
        'This endpoint accepts contact-form submissions only.',
        [],
        405
    );
}

if (!requestSizeIsAllowed()) {
    respondWithError(
        'Message too large',
        'The submitted request was larger than the contact form allows.',
        [],
        413
    );
}

if (!requestOriginIsAllowed()) {
    respondWithError(
        'Request could not be verified',
        'Return to the SecureHabit contact page and submit the form again.',
        [],
        403
    );
}




if (postedText('companyWebsite') !== '') {
    respondWithSuccess();
}

if (!submissionTimingLooksHuman()) {
    respondWithSuccess();
}

if (!rateLimitAllowsSubmission()) {
    respondWithError(
        'Too many recent submissions',
        'Please wait a few minutes before sending another inquiry.',
        [],
        429
    );
}

$allowedInquiryTypes = [
    'training-inquiry' => 'Cybersecurity-awareness training',
    'corporate-training' => 'Corporate training options',
    'general-question' => 'General question',
    'resource-question' => 'Training resource question',
    'specialist-inquiry' => 'Independent specialist inquiry',
    'collaboration' => 'Collaboration or partnership',
];

$allowedTrainingTopics = [
    '' => 'Not provided',
    'phishing-awareness' => 'Phishing awareness',
    'password-security' => 'Password security',
    'email-security' => 'Email security',
    'safe-remote-work' => 'Safe remote work',
    'social-engineering-awareness' => 'Social engineering awareness',
    'data-protection-basics' => 'Data protection basics',
    'multiple-topics' => 'Multiple training topics',
];

$allowedTeamSizes = [
    '' => 'Not provided',
    '1-10' => '1–10 people',
    '11-25' => '11–25 people',
    '26-50' => '26–50 people',
    '51-100' => '51–100 people',
    '101-250' => '101–250 people',
    '251-500' => '251–500 people',
    '500-plus' => 'More than 500 people',
    'not-sure' => 'Not sure yet',
];

$allowedTimings = [
    '' => 'Not provided',
    'exploring' => 'Exploring options',
    'within-month' => 'Within one month',
    'one-to-three-months' => 'Within one to three months',
    'later' => 'Later than three months',
];

$allowedDeliveryFormats = [
    'live-virtual' => 'Live virtual session',
    'in-person' => 'In-person session',
    'self-guided' => 'Self-guided resources',
    'not-sure' => 'Not sure yet',
];

$submission = [
    'fullName' => postedText('fullName'),
    'workEmail' => postedText('workEmail'),
    'organization' => postedText('organization'),
    'role' => postedText('role'),
    'inquiryType' => postedText('inquiryType'),
    'trainingTopic' => postedText('trainingTopic'),
    'teamSize' => postedText('teamSize'),
    'targetTiming' => postedText('targetTiming'),
    'deliveryFormats' => postedArray('deliveryFormat'),
    'message' => postedMultilineText('message'),
    'privacyConsent' => postedText('privacyConsent'),
    'sourcePage' => postedText('sourcePage'),
    'formTimestamp' => postedText('formTimestamp'),
];

$errors = validateSubmission(
    $submission,
    $allowedInquiryTypes,
    $allowedTrainingTopics,
    $allowedTeamSizes,
    $allowedTimings,
    $allowedDeliveryFormats
);

if ($errors !== []) {
    respondWithError(
        'Review the form details',
        'One or more submitted fields were incomplete or invalid.',
        $errors,
        422
    );
}

$recipient = environmentValue(
    'SECUREHABIT_CONTACT_TO',
    defaultContactAddress(DEFAULT_CONTACT_TO_LOCAL_PART)
);

$fromEmail = environmentValue(
    'SECUREHABIT_CONTACT_FROM',
    defaultContactAddress(DEFAULT_CONTACT_FROM_LOCAL_PART)
);

$fromName = environmentValue(
    'SECUREHABIT_CONTACT_FROM_NAME',
    DEFAULT_CONTACT_FROM_NAME
);

if (!filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
    error_log(
        'SecureHabit contact endpoint: invalid recipient address configuration.'
    );

    respondWithError(
        'Contact delivery is not configured',
        'The website contact mailbox is not configured correctly yet. Please use the direct email shown on the contact page.',
        [],
        503
    );
}

if (!filter_var($fromEmail, FILTER_VALIDATE_EMAIL)) {
    error_log(
        'SecureHabit contact endpoint: invalid sender address configuration.'
    );

    respondWithError(
        'Contact delivery is not configured',
        'The website mail sender is not configured correctly yet. Please use the direct email shown on the contact page.',
        [],
        503
    );
}

if (
    hasExampleDomain($recipient) ||
    hasExampleDomain($fromEmail)
) {
    error_log(
        'SecureHabit contact endpoint: placeholder .example email configuration is still active.'
    );

    respondWithError(
        'Contact delivery is not configured',
        'The contact form is ready, but the production email addresses still need to be configured on the server.',
        [],
        503
    );
}

$subject = buildSubject(
    $submission,
    $allowedInquiryTypes
);

$body = buildMessageBody(
    $submission,
    $allowedInquiryTypes,
    $allowedTrainingTopics,
    $allowedTeamSizes,
    $allowedTimings,
    $allowedDeliveryFormats
);

$delivered = sendContactEmail(
    $recipient,
    $fromEmail,
    $fromName,
    $submission['workEmail'],
    $subject,
    $body
);

if (!$delivered) {
    error_log(
        'SecureHabit contact endpoint: mail delivery failed.'
    );

    respondWithError(
        'The inquiry could not be delivered',
        'The server could not send the message. Please use the direct email address shown on the contact page.',
        [],
        503
    );
}

recordSuccessfulSubmission();
respondWithSuccess();






function sendSecurityHeaders(): void
{
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header(
        'Permissions-Policy: camera=(), microphone=(), geolocation=()'
    );

    header(
        "Content-Security-Policy: default-src 'self'; " .
            "img-src 'self' data:; " .
            "style-src 'self' 'unsafe-inline'; " .
            "font-src 'self'; " .
            "base-uri 'none'; " .
            "form-action 'self'; " .
            "frame-ancestors 'none'"
    );
}

function startContactSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $isSecure = isHttpsRequest();

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => $isSecure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    @session_start();
}

function isHttpsRequest(): bool
{
    if (
        !empty($_SERVER['HTTPS']) &&
        strtolower((string) $_SERVER['HTTPS']) !== 'off'
    ) {
        return true;
    }

    return strtolower(
        (string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')
    ) === 'https';
}

function requestSizeIsAllowed(): bool
{
    $contentLength = (int) (
        $_SERVER['CONTENT_LENGTH'] ?? 0
    );

    return $contentLength <= MAX_REQUEST_BYTES;
}

function requestOriginIsAllowed(): bool
{
    $origin = trim(
        (string) ($_SERVER['HTTP_ORIGIN'] ?? '')
    );

    if ($origin === '') {
        return true;
    }

    $allowedOrigins = array_filter(
        array_map(
            'trim',
            explode(
                ',',
                environmentValue(
                    'SECUREHABIT_ALLOWED_ORIGINS',
                    ''
                )
            )
        )
    );

    if (in_array($origin, $allowedOrigins, true)) {
        return true;
    }

    $originHost = strtolower(
        (string) parse_url(
            $origin,
            PHP_URL_HOST
        )
    );

    $serverHost = strtolower(
        (string) ($_SERVER['HTTP_HOST'] ?? '')
    );

    $serverHost = preg_replace(
        '/:\d+$/',
        '',
        $serverHost
    ) ?? $serverHost;

    return (
        $originHost !== '' &&
        hash_equals(
            $serverHost,
            $originHost
        )
    );
}

function submissionTimingLooksHuman(): bool
{
    $rawTimestamp = postedText(
        'formTimestamp'
    );

    


    if ($rawTimestamp === '') {
        return true;
    }

    $timestamp = strtotime(
        $rawTimestamp
    );

    if ($timestamp === false) {
        return false;
    }

    $age = time() - $timestamp;

    return (
        $age >= MIN_FORM_SECONDS &&
        $age <= MAX_FORM_AGE_SECONDS
    );
}

function rateLimitAllowsSubmission(): bool
{
    if (
        session_status() !==
        PHP_SESSION_ACTIVE
    ) {
        return true;
    }

    $now = time();

    $timestamps =
        $_SESSION['securehabit_contact_submissions'] ?? [];

    if (!is_array($timestamps)) {
        $timestamps = [];
    }

    $timestamps = array_values(
        array_filter(
            $timestamps,
            static fn($timestamp): bool =>
            is_int($timestamp) &&
                $timestamp >= (
                    $now -
                    RATE_LIMIT_WINDOW_SECONDS
                )
        )
    );

    $_SESSION['securehabit_contact_submissions'] = $timestamps;

    return (
        count($timestamps) <
        RATE_LIMIT_MAX_SUBMISSIONS
    );
}

function recordSuccessfulSubmission(): void
{
    if (
        session_status() !==
        PHP_SESSION_ACTIVE
    ) {
        return;
    }

    $timestamps =
        $_SESSION['securehabit_contact_submissions'] ?? [];

    if (!is_array($timestamps)) {
        $timestamps = [];
    }

    $timestamps[] = time();

    $_SESSION['securehabit_contact_submissions'] = $timestamps;
}






function postedText(string $key): string
{
    $value = $_POST[$key] ?? '';

    if (is_array($value)) {
        return '';
    }

    $value = str_replace(
        [
            "\r",
            "\n",
            "\0",
        ],
        ' ',
        (string) $value
    );

    $value = preg_replace(
        '/\s+/u',
        ' ',
        $value
    ) ?? $value;

    return trim($value);
}

function postedMultilineText(
    string $key
): string {
    $value = $_POST[$key] ?? '';

    if (is_array($value)) {
        return '';
    }

    $value = str_replace(
        [
            "\r\n",
            "\r",
        ],
        "\n",
        (string) $value
    );

    $value = str_replace(
        "\0",
        '',
        $value
    );

    $value = preg_replace(
        '/[\t ]+\n/u',
        "\n",
        $value
    ) ?? $value;

    $value = preg_replace(
        '/\n{4,}/u',
        "\n\n\n",
        $value
    ) ?? $value;

    return trim($value);
}

function postedArray(
    string $key
): array {
    $value =
        $_POST[$key] ??
        $_POST[$key . '[]'] ??
        [];

    if (!is_array($value)) {
        $value = [$value];
    }

    $result = [];

    foreach ($value as $item) {
        if (is_array($item)) {
            continue;
        }

        $item = trim(
            str_replace(
                [
                    "\r",
                    "\n",
                    "\0",
                ],
                '',
                (string) $item
            )
        );

        if ($item !== '') {
            $result[] = $item;
        }
    }

    return array_values(
        array_unique($result)
    );
}

function textLength(
    string $value
): int {
    if (function_exists('mb_strlen')) {
        return mb_strlen(
            $value,
            'UTF-8'
        );
    }

    return strlen($value);
}






function validateSubmission(
    array $submission,
    array $allowedInquiryTypes,
    array $allowedTrainingTopics,
    array $allowedTeamSizes,
    array $allowedTimings,
    array $allowedDeliveryFormats
): array {
    $errors = [];

    $nameLength = textLength(
        $submission['fullName']
    );

    if (
        $nameLength < 2 ||
        $nameLength > 120
    ) {
        $errors[] =
            'Enter a full name between 2 and 120 characters.';
    }

    if (
        textLength(
            $submission['workEmail']
        ) > 180 ||
        !filter_var(
            $submission['workEmail'],
            FILTER_VALIDATE_EMAIL
        )
    ) {
        $errors[] =
            'Enter a valid email address.';
    }

    if (
        textLength(
            $submission['organization']
        ) > 180
    ) {
        $errors[] =
            'Keep the organization name under 180 characters.';
    }

    if (
        textLength(
            $submission['role']
        ) > 120
    ) {
        $errors[] =
            'Keep the role under 120 characters.';
    }

    if (
        !array_key_exists(
            $submission['inquiryType'],
            $allowedInquiryTypes
        )
    ) {
        $errors[] =
            'Choose a valid inquiry type.';
    }

    if (
        !array_key_exists(
            $submission['trainingTopic'],
            $allowedTrainingTopics
        )
    ) {
        $errors[] =
            'Choose a valid training topic.';
    }

    if (
        !array_key_exists(
            $submission['teamSize'],
            $allowedTeamSizes
        )
    ) {
        $errors[] =
            'Choose a valid team-size option.';
    }

    if (
        !array_key_exists(
            $submission['targetTiming'],
            $allowedTimings
        )
    ) {
        $errors[] =
            'Choose a valid timing option.';
    }

    if (
        count(
            $submission['deliveryFormats']
        ) >
        count($allowedDeliveryFormats)
    ) {
        $errors[] =
            'Choose only the available delivery-format options.';
    }

    foreach (
        $submission['deliveryFormats']
        as $format
    ) {
        if (
            !array_key_exists(
                $format,
                $allowedDeliveryFormats
            )
        ) {
            $errors[] =
                'Choose only the available delivery-format options.';

            break;
        }
    }

    $messageLength = textLength(
        $submission['message']
    );

    if (
        $messageLength < 20 ||
        $messageLength > 2000
    ) {
        $errors[] =
            'Enter an inquiry message between 20 and 2000 characters.';
    }

    if (
        $submission['privacyConsent'] !==
        'accepted'
    ) {
        $errors[] =
            'Confirm the privacy and sensitive-information statement.';
    }

    if (
        textLength(
            $submission['sourcePage']
        ) > 500
    ) {
        $errors[] =
            'The source-page value is invalid.';
    }

    return array_values(
        array_unique($errors)
    );
}






function buildSubject(
    array $submission,
    array $inquiryTypes
): string {
    $inquiry =
        $inquiryTypes[$submission['inquiryType']] ?? 'Website inquiry';

    return (
        'SecureHabit inquiry — ' .
        $inquiry
    );
}

function buildMessageBody(
    array $submission,
    array $inquiryTypes,
    array $trainingTopics,
    array $teamSizes,
    array $timings,
    array $deliveryFormats
): string {
    $lines = [
        'SECUREHABIT WEBSITE INQUIRY',
        str_repeat('=', 34),
        '',
        'Submitted: ' .
            gmdate('Y-m-d H:i:s') .
            ' UTC',

        'Source page: ' .
            (
                $submission['sourcePage'] !== ''
                ? $submission['sourcePage']
                : 'Not provided'
            ),

        '',
        'CONTACT DETAILS',
        str_repeat('-', 34),

        'Full name: ' .
            $submission['fullName'],

        'Email: ' .
            $submission['workEmail'],

        'Organization: ' .
            (
                $submission['organization'] !== ''
                ? $submission['organization']
                : 'Not provided'
            ),

        '',
        'INQUIRY CONTEXT',
        str_repeat('-', 34),

        'Inquiry type: ' .
            (
                $inquiryTypes[$submission['inquiryType']] ?? 'Unknown'
            ),

        'Training topic: ' .
            (
                $trainingTopics[$submission['trainingTopic']] ?? 'Not provided'
            ),

        'Team size: ' .
            (
                $teamSizes[$submission['teamSize']] ?? 'Not provided'
            ),

        '',
        'MESSAGE',
        str_repeat('-', 34),
        $submission['message'],

        '',
        'FORM CONFIRMATION',
        str_repeat('-', 34),

        'The sender confirmed that the inquiry does not intentionally include passwords, credentials, confidential incident evidence or regulated personal information.',

        '',
        'Reply directly to: ' .
            $submission['workEmail'],
    ];

    return implode(
        "\n",
        $lines
    );
}

function sendContactEmail(
    string $recipient,
    string $fromEmail,
    string $fromName,
    string $replyTo,
    string $subject,
    string $body
): bool {
    $encodedSubject = encodeMailHeader(
        $subject
    );

    $encodedFromName = encodeMailHeader(
        $fromName
    );

    $headers = [
        'MIME-Version: 1.0',

        'Content-Type: text/plain; charset=UTF-8',

        'Content-Transfer-Encoding: 8bit',

        'From: ' .
            $encodedFromName .
            ' <' .
            $fromEmail .
            '>',

        'Reply-To: ' .
            $replyTo,

        'X-Mailer: PHP/' .
            PHP_VERSION,
    ];

    $headerText = implode(
        "\r\n",
        $headers
    );

    $parameters =
        preg_match(
            '/^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$/i',
            $fromEmail
        )
        ? '-f' . $fromEmail
        : '';

    if ($parameters !== '') {
        return @mail(
            $recipient,
            $encodedSubject,
            $body,
            $headerText,
            $parameters
        );
    }

    return @mail(
        $recipient,
        $encodedSubject,
        $body,
        $headerText
    );
}

function encodeMailHeader(
    string $value
): string {
    $value = str_replace(
        [
            "\r",
            "\n",
            "\0",
        ],
        '',
        $value
    );

    if (
        function_exists(
            'mb_encode_mimeheader'
        )
    ) {
        return mb_encode_mimeheader(
            $value,
            'UTF-8',
            'B',
            "\r\n"
        );
    }

    return $value;
}

function environmentValue(
    string $name,
    string $fallback
): string {
    $value = getenv($name);

    if (
        $value === false ||
        trim($value) === ''
    ) {
        return $fallback;
    }

    return trim($value);
}

function defaultContactAddress(
    string $localPart
): string {
    $host = currentRequestHost();

    if (!hostCanReceiveMail($host)) {
        return '';
    }

    $host = preg_replace(
        '/^www\./i',
        '',
        $host
    ) ?? $host;

    return $localPart . '@' . $host;
}

function currentRequestHost(): string
{
    $host = strtolower(
        trim(
            (string) (
                $_SERVER['HTTP_HOST'] ??
                $_SERVER['SERVER_NAME'] ??
                ''
            )
        )
    );

    $host = preg_replace(
        '/:\d+$/',
        '',
        $host
    ) ?? $host;

    return trim(
        $host,
        " \t\n\r\0\x0B[]"
    );
}

function hostCanReceiveMail(
    string $host
): bool {
    if (
        $host === '' ||
        $host === 'localhost' ||
        !str_contains($host, '.') ||
        filter_var($host, FILTER_VALIDATE_IP)
    ) {
        return false;
    }

    foreach (
        [
            '.example',
            '.invalid',
            '.localhost',
            '.test',
        ]
        as $blockedSuffix
    ) {
        if (
            str_ends_with(
                $host,
                $blockedSuffix
            )
        ) {
            return false;
        }
    }

    return true;
}

function hasExampleDomain(
    string $email
): bool {
    $domain = strtolower(
        (string) substr(
            strrchr(
                $email,
                '@'
            ) ?: '',
            1
        )
    );

    return (
        $domain === 'example' ||
        str_ends_with(
            $domain,
            '.example'
        )
    );
}






function wantsJsonResponse(): bool
{
    $accept = strtolower(
        (string) (
            $_SERVER['HTTP_ACCEPT'] ??
            ''
        )
    );

    $requestedWith = strtolower(
        (string) (
            $_SERVER['HTTP_X_REQUESTED_WITH'] ?? ''
        )
    );

    return (
        str_contains(
            $accept,
            'application/json'
        ) ||
        $requestedWith ===
        'xmlhttprequest'
    );
}

function respondWithSuccess(): never
{
    if (wantsJsonResponse()) {
        http_response_code(200);

        header(
            'Content-Type: application/json; charset=UTF-8'
        );

        echo json_encode(
            [
                'ok' => true,
                'message' =>
                'Your inquiry was received for review.',
            ],
            JSON_UNESCAPED_SLASHES |
                JSON_UNESCAPED_UNICODE
        );

        exit;
    }

    setResultFlash([
        'type' => 'success',
        'title' => 'Inquiry sent',

        'message' =>
        'Your message was delivered for review. Response timing may vary.',

        'details' => [],
    ]);

    redirectToResult('success');
}

function respondWithError(
    string $title,
    string $message,
    array $details,
    int $status
): never {
    if (wantsJsonResponse()) {
        http_response_code($status);

        header(
            'Content-Type: application/json; charset=UTF-8'
        );

        echo json_encode(
            [
                'ok' => false,
                'message' => $message,
                'errors' =>
                array_values($details),
            ],
            JSON_UNESCAPED_SLASHES |
                JSON_UNESCAPED_UNICODE
        );

        exit;
    }

    setResultFlash([
        'type' => 'error',
        'title' => $title,
        'message' => $message,
        'details' =>
        array_values($details),
        'status' => $status,
    ]);

    redirectToResult('error');
}

function setResultFlash(
    array $result
): void {
    if (
        session_status() ===
        PHP_SESSION_ACTIVE
    ) {
        $_SESSION['securehabit_contact_result'] = $result;
    }
}

function redirectToResult(
    string $result
): never {
    header(
        'Location: ' .
            RESULT_PAGE .
            '?result=' .
            rawurlencode($result),
        true,
        303
    );

    exit;
}

function handleResultPage(): never
{
    $resultType = strtolower(
        trim(
            (string) (
                $_GET['result'] ?? ''
            )
        )
    );

    if (
        !in_array(
            $resultType,
            [
                'success',
                'error',
            ],
            true
        )
    ) {
        header(
            'Location: ' .
                CONTACT_PAGE,
            true,
            302
        );

        exit;
    }

    $flash = null;

    if (
        session_status() ===
        PHP_SESSION_ACTIVE
    ) {
        $flash =
            $_SESSION['securehabit_contact_result'] ?? null;

        unset(
            $_SESSION['securehabit_contact_result']
        );
    }

    if (!is_array($flash)) {
        $flash =
            $resultType === 'success'
            ? [
                'type' => 'success',

                'title' =>
                'Inquiry received',

                'message' =>
                'The contact request was processed.',

                'details' => [],
            ]
            : [
                'type' => 'error',

                'title' =>
                'Inquiry not sent',

                'message' =>
                'Return to the contact page and try again, or use the direct email address shown there.',

                'details' => [],
            ];
    }

    $status = (int) (
        $flash['status'] ?? 200
    );

    http_response_code(
        $status >= 400
            ? $status
            : 200
    );

    renderResultPage($flash);

    exit;
}

function renderResultPage(
    array $result
): void {
    $type =
        ($result['type'] ?? '') ===
        'success'
        ? 'success'
        : 'error';

    $title = escapeHtml(
        (string) (
            $result['title'] ??
            'Contact result'
        )
    );

    $message = escapeHtml(
        (string) (
            $result['message'] ?? ''
        )
    );

    $details =
        is_array(
            $result['details'] ?? null
        )
        ? $result['details']
        : [];

    header(
        'Content-Type: text/html; charset=UTF-8'
    );

    $icon =
        $type === 'success'
        ? '✓'
        : '!';

    $label =
        $type === 'success'
        ? 'Submission complete'
        : 'Submission needs attention';

    $pageTitle =
        $type === 'success'
        ? 'Inquiry Sent | SecureHabit'
        : 'Inquiry Not Sent | SecureHabit';

    echo '<!DOCTYPE html>';
    echo '<html lang="en">';

    echo '<head>';
    echo '<meta charset="UTF-8">';

    echo '<meta name="viewport" content="width=device-width, initial-scale=1">';

    echo '<meta name="robots" content="noindex, nofollow">';

    echo '<meta name="theme-color" content="#001225">';

    echo '<title>' .
        escapeHtml($pageTitle) .
        '</title>';

    echo '<link rel="icon" href="assets/images/favicon.svg" type="image/svg+xml">';

    echo '<style>';

    echo ':root{font-family:Manrope,Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#f7fbff;background:#001225}';

    echo '*{box-sizing:border-box}';

    echo 'body{min-height:100vh;margin:0;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 75% 20%,rgba(98,108,246,.24),transparent 30%),radial-gradient(circle at 25% 80%,rgba(22,215,196,.12),transparent 34%),#001225}';

    echo '.card{position:relative;width:min(100%,760px);padding:clamp(28px,6vw,64px);overflow:hidden;background:linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.025));border:1px solid rgba(255,255,255,.17);border-radius:22px 22px 96px 22px;box-shadow:0 40px 100px rgba(0,7,22,.42);backdrop-filter:blur(16px)}';

    echo '.card:before{position:absolute;top:0;right:42px;width:110px;height:14px;content:"";background:linear-gradient(120deg,#16d7c4,#318cf4 38%,#626cf6 68%,#ed149f);clip-path:polygon(0 0,100% 0,82% 100%,18% 100%)}';

    echo '.icon{display:grid;width:72px;height:72px;place-items:center;border-radius:50%;font-size:32px;font-weight:900;color:#001225;background:' .
        (
            $type === 'success'
            ? '#2af0df'
            : '#ff7fb9'
        ) .
        ';box-shadow:0 18px 42px rgba(22,215,196,.18)}';

    echo '.eyebrow{display:block;margin-top:26px;color:#2af0df;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}';

    echo 'h1{max-width:620px;margin:10px 0 0;font-size:clamp(42px,8vw,82px);line-height:.95;letter-spacing:-.045em}';

    echo 'p{max-width:650px;margin:20px 0 0;color:rgba(247,251,255,.72);font-size:17px;line-height:1.75}';

    echo 'ul{display:grid;gap:8px;margin:22px 0 0;padding:18px 18px 18px 38px;color:rgba(247,251,255,.76);background:rgba(0,18,37,.44);border-left:3px solid #ed149f}';

    echo 'li{line-height:1.55}';

    echo '.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}';

    echo 'a{display:inline-flex;min-height:50px;align-items:center;justify-content:center;padding:12px 20px;border-radius:999px;font-size:14px;font-weight:800;text-decoration:none}';

    echo '.primary{color:#001225;background:#2af0df;border:1px solid #2af0df}';

    echo '.secondary{color:#fff;background:transparent;border:1px solid rgba(255,255,255,.28)}';

    echo 'a:focus-visible{outline:3px solid #fff;outline-offset:4px}';

    echo '</style>';
    echo '</head>';

    echo '<body>';
    echo '<main class="card">';

    echo '<span class="icon" aria-hidden="true">' .
        $icon .
        '</span>';

    echo '<span class="eyebrow">' .
        escapeHtml($label) .
        '</span>';

    echo '<h1>' .
        $title .
        '</h1>';

    echo '<p>' .
        $message .
        '</p>';

    if ($details !== []) {
        echo '<ul>';

        foreach ($details as $detail) {
            echo '<li>' .
                escapeHtml(
                    (string) $detail
                ) .
                '</li>';
        }

        echo '</ul>';
    }

    echo '<div class="actions">';

    echo '<a class="primary" href="' .
        escapeHtml(CONTACT_PAGE) .
        '">Return to contact page</a>';

    echo '<a class="secondary" href="index.html">Go to homepage</a>';

    echo '</div>';
    echo '</main>';
    echo '</body>';
    echo '</html>';
}

function escapeHtml(
    string $value
): string {
    return htmlspecialchars(
        $value,
        ENT_QUOTES |
            ENT_SUBSTITUTE,
        'UTF-8'
    );
}
