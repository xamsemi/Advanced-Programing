const express = require('express');
const serviceRouter = express.Router();
const helper = require('../helper.js');
const nodemailer = require("nodemailer");

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "maddison53@ethereal.email",
    pass: "jn7jnAPss4f63QBp6D",
  },
});



console.log('- Service Mailer');

// --- Alle Touren abrufen ---
serviceRouter.post('/getTour', async (req, res) => {
    console.log('Mailer: Member booked a tour, sending confirmation email.');
    try {
        // Wrap in an async IIFE so we can use await.
        (async () => {
        const info = await transporter.sendMail({
            from: '"Maddison Foo Koch" <maddison53@ethereal.email>',
            to: "bar@example.com, baz@example.com",
            subject: "Hello ✔",
            text: "Hello world?", // plain‑text body
            html: "<b>Hello world?</b>", // HTML body
        });

        console.log("Message sent:", info.messageId);
        })();
        
        res.status(200).json({ message: '"Message send!"'});
    } catch (err) {
        console.error('Service Tour: Error loading tours', err);
        res.status(500).json({ fehler: true, nachricht: err.message });
    }
});