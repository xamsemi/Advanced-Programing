
const express = require('express');
const serviceRouter = express.Router();
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const UserDao = require('../dao/userDao.js');

console.log('- Service User');

// --- Rate Limiting (gegen Brute Force) ---
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 Minute
  max: 50,
  message: "Zu viele Login-Versuche. Bitte warte eine Minute.",
});


serviceRouter.post('/login', loginLimiter, function(req, res) {
    console.log('Service User: Client requested login');

    const { username, password } = req.body;
    
    if (!username || !password) {
        console.log('Service User: Login not possible, missing username or password');
        return res.status(400).json({ 'fehler': true, 'nachricht': 'Benutzername oder Passwort fehlen' });
    }

    const userDao = new UserDao(req.app.locals.dbConnection);
    userDao.getUserByUserName(username, (err, user) => {

        if (err) {
            console.error('Service User: Error fetching user:', err.message);
            return res.status(500).json({ 'fehler': true, 'nachricht': 'Interner Serverfehler' });
        }
        if (!user) {
            console.error('Service User: User not found');
            return res.status(404).json({ 'fehler': true, 'nachricht': 'Benutzer nicht gefunden' });
        }
        
        // Compare passwords
        userDao.comparePassword(password, user.password_hash, (err, match) => {
            if (err) {
                console.error('Service User: Error comparing passwords:', err.message);
                return res.status(500).json({ 'fehler': true, 'nachricht': 'Interner Serverfehler' });
            }

            if (!match) {
                console.error('Service User: Passwords do not match');
                return res.status(401).json({ 'fehler': true, 'nachricht': 'Passwort ist falsch' });
            }

            // Generate token
            const token = userDao.generateToken(username);
            console.log('Service User: Login successful');
            req.session.user = { username: user.username, role: user.user_role };
            res.status(200).json({ 'token': token });
        });
    });
});

// Logout endpoint
serviceRouter.post('/logout', (req, res) => {
    console.log('Service User: Client requested logout');

    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                console.error('Service User: Logout error', err);
                return res.status(500).json({ fehler: true, nachricht: 'Logout fehlgeschlagen' });
            }
            res.clearCookie('connect.sid'); // Session-Cookie löschen
            console.log('Service User: Logout successful');
            res.status(200).json({ message: 'Logout erfolgreich' });
        });
    } else {
        res.status(200).json({ message: 'Keine aktive Session' });
    }
});

// --- Profilabfrage (für Frontend checkLogin) ---
serviceRouter.get('/profile', (req, res) => {
    if (req.session && req.session.user) {
        res.json({ username: req.session.user.username, role: req.session.user.role });
    } else {
        res.status(401).json({ message: 'Kein Benutzer eingeloggt' });
    }
});


// --- Alle User abrufen ---

serviceRouter.get('/', async (req, res) => {
    console.log('Service Users: Client requested all users');

    try {
        
       const usersDao = new UserDao(req.app.locals.dbConnection);

        const users = await usersDao.getAllUsers();
        res.status(200).json({ message: 'success', data: users });
    } catch (err) {
        console.error('Service Users: Error loading users', err);
        res.status(500).json({ fehler: true, nachricht: err.message });
    }
});

// --- Einzelnen Benutzer abrufen ---
serviceRouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    console.log('Service User: Client requested user id=' + id);
    const usersDao = new UserDao(req.app.locals.dbConnection);

    try {
        const users = await usersDao.getUserByID(id);
        res.status(200).json({ message: 'success', data: users });
    } catch (err) {
        console.error('Service Users: Error loading users:', err.message);
        res.status(404).json({ fehler: true, nachricht: 'Benutzer nicht gefunden' });
    }
});

// Benutzer löschen
serviceRouter.delete('/:id', (req, res) => {
    const { id } = req.params;
    console.log('Service Users: Client requested deletion of user id=' + id);
    const usersDao = new UserDao(req.app.locals.dbConnection);  
    usersDao.deleteUserByID(id, (err, result) => {
        if (err) {
            console.error('Service Users: Fehler beim Löschen des Users:', err.message);
            return res.status(500).json({ fehler: true, nachricht: err.message });
        }
        if (!result) {
            return res.status(404).json({ fehler: true, nachricht: 'Benutzer nicht gefunden' });
        }
        res.status(200).json({ message: 'Benutzer gelöscht' });
    });
});

// Bestehenden Benutzer aktualisieren
serviceRouter.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { username, address, email, user_role, created_at } = req.body;
    console.log('Service Users: Client requested update of user id=' + id);
    const usersDao = new UserDao(req.app.locals.dbConnection);
    try {
        const updated = await usersDao.updateUserByID(id, { username, address, email, user_role, created_at }); 
        res.status(200).json({ message: 'Benutzer aktualisiert', data: updated });
    } catch (err) {
        console.error('Service Users: Error updating user:', err.message);
        res.status(500).json({ fehler: true, nachricht: 'Fehler beim Aktualisieren des Benutzers' });
    }
});

// neuen Nutzer erstellen
serviceRouter.post("/", async (req, res) => {
  const { username, address, email, user_role, password_hash, created_at } = req.body;
  const usersDao = new UserDao(req.app.locals.dbConnection);

  try {
    const newUserId = await usersDao.createUser({ username, address, email, user_role, password_hash, created_at });
    res.status(201).json({ message: "Benutzer erfolgreich erstellt", user_id: newUserId });
  } catch (err) {
    console.error("Fehler beim Erstellen des Users:", err.message);
    res.status(500).json({ fehler: true, nachricht: err.message });
  }
});




serviceRouter.post("/register", async (req, res) => {

    const { username, password, email} = req.body;
    const user_role = 'user'; // default role

    if (!username || !password || !email ) {
        return res.status(400).json({ message: 'Username, Passwort, Email erforderlich' });
    }
    // Prüfen, ob Benutzer existiert
    const userDao = new UserDao(req.app.locals.dbConnection);
    userDao.getUserByUserName(username, (err, user) => {
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
