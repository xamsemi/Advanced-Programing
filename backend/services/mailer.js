const express = require('express');
const serviceRouter = express.Router();
const helper = require('../helper.js');
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'bette.thompson@ethereal.email',
        pass: 'mSVCT2wa67f3HHAfDS'
    }
});



console.log('- Service Mailer');

// --- Alle Touren abrufen ---
serviceRouter.post('/getTour', async (req, res) => {
    console.log('Mailer: Member booked a tour, sending confirmation email.');
    try {
        // Wrap in an async IIFE so we can use await.
        (async () => {
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
        })();
        
        res.status(200).json({ message: '"Message send!"'});
    } catch (err) {
        console.error('Service Tour: Error loading tours', err);
        res.status(500).json({ fehler: true, nachricht: err.message });
    }
});

module.exports = serviceRouter;