const helper = require('../helper.js');
const express = require('express');
const serviceRouter = express.Router();
const nodemailer = require("nodemailer");
const TourDao = require('../dao/tourDao.js');
const UserDao = require('../dao/userDao.js');

// create reusable transporter object using the default SMTP transport

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 587,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
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
serviceRouter.post('/tour', sessionChecker, async (req, res) => {

    const { tourId, emailSubject, emailBody } = req.body;
    const tourDao = new TourDao(req.app.locals.dbConnection);

    const emailAdress = '';
    tourDao.getTourById(tourId).then(async () => {
        const tourData = await tourDao.getTourById(tourId);
        console.log('Mailer: Tour data fetched', tourData);
        console.log('Mailer: Email data fetched', tourData.bus.company.company_email);
        emailAdress = tourData.bus.company.company_email;
    });

    console.log('Mailer: tourId, emailSubject, emailBody', tourId, emailSubject, emailBody);
    try {
        const info = await transporter.sendMail({
            from: '"Fasnetsverein Reutlingen" <narinaro@reutlingen.to>',
            to: emailAdress,
            subject: emailSubject,
            text: emailBody, // plain‑text body
            html: `<p>${emailBody}</p>`, // HTML body
        });
        console.log("Message sent:", info.messageId);
        res.status(200).json({ message: 'Message sent!' });
    } catch (err) {
        console.error('Service Mailer: Error sending mail', err);
        res.status(500).json({ fehler: true, nachricht: err.message });
    }    
});

// --- Alle Touren abrufen ---
serviceRouter.post('/member', sessionChecker, async (req, res) => {
    console.log('Mailer: Member booked a tour, sending confirmation email.');

    const { userId, emailSubject, emailBody } = req.body;
    const userDao = new UserDao(req.app.locals.dbConnection);

    const emailAdress = '';
    userDao.getTourById(userId).then(async () => {
        const userData = await userDao.getUserById(tourId);
        console.log('Mailer: Tour data fetched', userData);
        console.log('Mailer: Email data fetched', userData.user_email);
        emailAdress = userData.user_email;
    });


    try {
        const info = await transporter.sendMail({
            from: '"Fasnetsverein Reutlingen" <narinaro@reutlingen.to>',
            to: emailAdress,
            subject: emailSubject,
            text: emailBody, // plain‑text body
            html: "<p>${emailBody}</p>", // HTML body
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