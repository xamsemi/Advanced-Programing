const express = require('express');
const serviceRouter = express.Router();
const helper = require('../helper.js');
const nodemailer = require("nodemailer");
const session = require('express-session');

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'bette.thompson@ethereal.email',
        pass: 'mSVCT2wa67f3HHAfDS'
    }
});

console.log('- Service Mailer');

// prüfe ob eine session existiert
const sessionChecker = (req, res, next) => {
    // express-session provides req.session; prefer checking session content / sessionID
    try {
        if (req && req.session && req.session.user) {
            return next();
        }
    } catch (e) {
        // defensive: if req.session is not available, treat as unauthenticated
        console.error('sessionChecker error:', e && e.message);
    }
    return res.status(401).json({ fehler: true, nachricht: 'Nicht eingeloggt' });
};

// --- Alle Touren abrufen ---
serviceRouter.post('/getTour', sessionChecker, async (req, res) => {
    console.log('Mailer: Member booked a tour, sending confirmation email.');
    try {
        const info = await transporter.sendMail({
            from: '"Maddison Foo Koch" <bette.thompson@ethereal.email>',
            to: "bar@example.com, baz@example.com",
            subject: "Hello ✔",
            text: "Hello world?", // plain‑text body
            html: "<b>Hello world?</b>", // HTML body
        });

        // return url for previewing the email
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        console.log("Message sent:", info.messageId);

        res.status(200).json({ message: 'Message sent!' });
    } catch (err) {
        console.error('Service Mailer: Error sending mail', err);
        res.status(500).json({ fehler: true, nachricht: err.message });
    }
});

module.exports = serviceRouter;