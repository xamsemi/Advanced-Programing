
const express = require('express');
const serviceRouter = express.Router();
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const UserDao = require('../dao/userDao');

console.log('- Service User');

// --- Rate Limiting (gegen Brute Force) ---
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 Minute
  max: 5,
  message: "Zu viele Login-Versuche. Bitte warte eine Minute.",
});

// Login endpoint
serviceRouter.post('/login', loginLimiter, function(req, res) {
    console.log('Service User: Client requested login');

    const { username, password } = req.body;

    if (!username || !password) {
        console.log('Service User: Login not possible, missing username or password');
        return res.status(400).json({ 'fehler': true, 'nachricht': 'Benutzername oder Passwort fehlen' });
    }

    const userDao = new UserDao(req.app.locals.dbConnection);
    userDao.getUserByUsername(username, (err, user) => {
        if (err) {
            console.error('Service User: Error fetching user:', err.message);
            return res.status(500).json({ 'fehler': true, 'nachricht': 'Interner Serverfehler' });
        }
        if (!user) {
            console.log('Service User: User not found');
            return res.status(404).json({ 'fehler': true, 'nachricht': 'Benutzer nicht gefunden' });
        }
        
        // Compare passwords
        userDao.comparePassword(password, user.password_hash, (err, match) => {
            if (err) {
                console.error('Service User: Error comparing passwords:', err.message);
                return res.status(500).json({ 'fehler': true, 'nachricht': 'Interner Serverfehler' });
            }

            if (!match) {
                console.log('Service User: Passwords do not match');
                return res.status(401).json({ 'fehler': true, 'nachricht': 'Passwort ist falsch' });
            }

            // Generate token
            const token = userDao.generateToken(username);
            console.log('Service User: Login successful');
            res.status(200).json({ 'token': token });
        });
    });
});

serviceRouter.post("/register", async (req, res) => {
    const { username, password, email, user_role } = req.body;

    if (!username || !password || !email || !user_role) {
        return res.status(400).json({ message: 'Username, Passwort, Email und Benutzerrolle erforderlich' });
    }

    // Prüfen, ob Benutzer existiert
    const userDao = new UserDao(req.app.locals.dbConnection);
    userDao.getUserByUsername(username, (err, user) => {
        if (err) {
            console.error('Error fetching user:', err.message);
            return res.status(500).json({ message: 'Interner Serverfehler' });
        }
        if (user) {
            return res.status(400).json({ message: 'Benutzer existiert bereits' });
        }
        // Passwort hashen SALT_ROUNDS = 10
        const SALT_ROUNDS = 10;
        bcrypt.hash(password, SALT_ROUNDS, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password:', err.message);
                return res.status(500).json({ message: 'Interner Serverfehler' });
            }

            // Benutzer speichern
            const userDao = new UserDao(req.app.locals.dbConnection);
            userDao.createUser(username, email, user_role, hashedPassword, (err, userId) => {
                if (err) {
                    console.error('Error creating user:', err.message);
                    return res.status(500).json({ message: 'Interner Serverfehler' });
                }
                res.status(201).json({ message: 'Benutzer registriert' });
            });
        });
    });
});
module.exports = serviceRouter;
