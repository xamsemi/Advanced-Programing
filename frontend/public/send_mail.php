<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php'; // falls du Composer nutzt

// --- DB-Verbindung ---
$pdo = new PDO("mysql:host=localhost;dbname=dbConnection;charset=utf8", "user", "pass");

// --- Formulardaten ---
$subject = $_POST['subject'] ?? '';
$message = $_POST['message'] ?? '';

if (empty($subject) || empty($message)) {
    die("Bitte Betreff und Nachricht ausfüllen.");
}

// --- E-Mails aus DB holen ---
$stmt = $pdo->query("SELECT company_email FROM bus_companies WHERE company_email IS NOT NULL AND company_email != ''");
$emails = $stmt->fetchAll(PDO::FETCH_COLUMN);

if (empty($emails)) {
    die("Keine E-Mailadressen gefunden.");
}

// --- PHPMailer konfigurieren ---
$mail = new PHPMailer(true);

try {
    // SMTP-Einstellungen (Beispiel: Gmail)
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'deinemail@googlemail.com';   // <-- deine E-Mail-Adresse
    $mail->Password   = 'deinAppPasswort';          // <-- kein normales Passwort, siehe unten!
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    $mail->setFrom('deinemail@googlemail.com', 'Dein Firmenname');
    $mail->addReplyTo('deinemail@googlemail.com');

    // Empfänger als BCC hinzufügen
    foreach ($emails as $email) {
        $mail->addBCC($email);
    }

    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body    = nl2br(htmlspecialchars($message));
    $mail->AltBody = strip_tags($message);

    $mail->send();
    echo "E-Mails erfolgreich an alle Busunternehmen verschickt!";

} catch (Exception $e) {
    echo "Fehler beim Senden: {$mail->ErrorInfo}";
}
?>
