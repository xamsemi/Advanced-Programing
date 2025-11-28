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

    try {
        // Warten bis Tourdaten geladen sind
        const tourData = await tourDao.getTourById(tourId);
        if (!Array.isArray(tourData) || tourData.length === 0) {
            return res.status(404).json({ fehler: true, nachricht: 'Tour nicht gefunden' });
        }

        const tour = tourData[0];
        const companyEmail = tour?.bus?.company?.company_email;
        if (!companyEmail) {
            return res.status(400).json({ fehler: true, nachricht: 'Keine Firmen-E-Mail gefunden' });
        }

        console.log('Mailer: Tour data fetched', tour);
        console.log('Mailer: Email data fetched', companyEmail);

        const info = await transporter.sendMail({
            from: '"Fasnetsverein Reutlingen" <narinaro@reutlingen.to>',
            to: companyEmail,
            subject: emailSubject,
            text: emailBody,
            html: `<p>${emailBody}</p>`,
        });

        console.log("Message sent:", info.messageId);
        return res.status(200).json({ message: 'Message sent!' });

    } catch (err) {
        console.error('Service Mailer: Error sending mail', err);
        return res.status(500).json({ fehler: true, nachricht: err.message });
    }    
});

// --- Member Mail --- (korrigiert: user DAO nutzen, await)
serviceRouter.post('/member', sessionChecker, async (req, res) => {
    const { userId, emailSubject, emailBody } = req.body;
    const userDao = new UserDao(req.app.locals.dbConnection);

    try {
        const userData = await userDao.getUserById(userId);
        if (!userData) return res.status(404).json({ fehler: true, nachricht: 'User nicht gefunden' });

        const userEmail = userData.user_email || userData.email || userData.email_address;
        if (!userEmail) return res.status(400).json({ fehler: true, nachricht: 'Keine Nutzer-E-Mail gefunden' });

        const info = await transporter.sendMail({
            from: '"Fasnetsverein Reutlingen" <narinaro@reutlingen.to>',
            to: userEmail,
            subject: emailSubject,
            text: emailBody,
            html: `<p>${emailBody}</p>`,
        });

        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        console.log("Message sent:", info.messageId);
        return res.status(200).json({ message: 'Message sent!' });
    } catch (err) {
        console.error('Service Mailer: Error sending mail', err);
        return res.status(500).json({ fehler: true, nachricht: err.message });
    }
});

module.exports = serviceRouter;