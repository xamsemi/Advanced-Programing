
const express = require('express');
const serviceRouter = express.Router();
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const UserDao = require('../dao/userDao.js');
const UserTourDao = require('../dao/userTourDao.js');
const TourDao = require('../dao/tourDao.js');
const BusesDao = require('../dao/busesDao.js');
const BuscompaniesDao = require('../dao/buscompaniesDao.js');

console.log('- Service User');

// --- Rate Limiting (gegen Brute Force) ---
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 Minute
  max: 50,
  message: "Zu viele Login-Versuche. Bitte warte eine Minute.",
});

serviceRouter.post('/login', loginLimiter, function(req, res) {
    /*
    #swagger.tags = ['Users']
    #swagger.description = 'Endpoint zum Einloggen eines Benutzers.'
    #swagger.summary = 'Login eines Benutzers
    #swagger.parameters['obj'] = {
        in: 'body',
        description: 'Benutzername und Passwort des Benutzers',
        required: true,
        schema: { $username: 'MaxMustermann', $password: 'geheim' }
    }
    #swagger.responses[200] = {
        description: 'Erfolgreiches Login',
        schema: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
    }
    #swagger.responses[400] = {
        description: 'Fehlende Parameter',
        schema: { fehler: true, nachricht: 'Benutzername oder Passwort fehlen' }
    }
    #swagger.responses[401] = {
        description: 'Falsches Passwort',
        schema: { fehler: true, nachricht: 'Passwort ist falsch' }
    }
    #swagger.responses[404] = {
        description: 'Benutzer nicht gefunden',
        schema: { fehler: true, nachricht: 'Benutzer nicht gefunden' }
    }
    #swagger.responses[500] = {
        description: 'Interner Serverfehler',
        schema: { fehler: true, nachricht: 'Interner Serverfehler' }
    }
    */
    const userDao = new UserDao(req.app.locals.dbConnection);
    console.log('Service User: Client requested login');
    
    const { username, password } = req.body;
    
    if (!username || !password) {
        console.log('Service User: Login not possible, missing username or password');
        return res.status(400).json({ 'fehler': true, 'nachricht': 'Benutzername oder Passwort fehlen' });
    }

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
            return res.status(200).json({ 'token': token });
        });
    });
});

serviceRouter.post('/logout', (req, res) => {
    /*
    #swagger.tags = ['Users']
    #swagger.description = 'Endpoint zum Ausloggen eines Benutzers.'
    #swagger.summary = 'Logout eines Benutzers'
    #swagger.responses[200] = {
        description: 'Erfolgreiches Logout',
        schema: { message: 'Logout erfolgreich' } 
    }
    #swagger.responses[404] = {
        description: 'Keine aktive Session',
        schema: { message: 'Keine aktive Session' }
    }
    #swagger.responses[500] = {
        description: 'Fehler beim Logout',
        schema: { fehler: true, nachricht: 'Logout fehlgeschlagen' }
    }
    */
    console.log('Service User: Client requested logout');

    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                console.error('Service User: Logout error', err);
                return res.status(500).json({ fehler: true, nachricht: 'Logout fehlgeschlagen' });
            }
            res.clearCookie('connect.sid'); // Session-Cookie löschen
            console.log('Service User: Logout successful');
            return res.status(200).json({ message: 'Logout erfolgreich' });
        });
    } else {
        return res.status(404).json({ message: 'Keine aktive Session' });
    }
});

serviceRouter.get('/profile', (req, res) => {
    /*
    #swagger.tags = ['Users']
    #swagger.description = 'Endpoint zum Abrufen des Profils des eingeloggten Benutzers.'
    #swagger.summary = 'Profil des eingeloggten Benutzers abrufen'
    #swagger.responses[200] = {
        description: 'Erfolgreiches Abrufen des Profils',
        schema: { username: 'MaxMustermann', role: 'user' }
    }
    #swagger.responses[401] = {
        description: 'Kein Benutzer eingeloggt',
        schema: { message: 'Kein Benutzer eingeloggt' }
    }
    */
    if (req.session && req.session.user) {
        return res.json({ username: req.session.user.username, role: req.session.user.role });
    } else {
        return res.status(401).json({ message: 'Kein Benutzer eingeloggt' });
    }
});


// --- Alle User abrufen ---
serviceRouter.get('/', async (req, res) => {
    const usersDao = new UserDao(req.app.locals.dbConnection);
    const userTourDao = new UserTourDao(req.app.locals.dbConnection);
    console.log('Service Users: Client requested all users');
    try {
        const user = await usersDao.getAllUsers();
        if (!user) return res.status(404).json({ fehler: true, nachricht: 'Benutzer nicht gefunden' });

        for (const u of user) {
            // Zugeordnete Touren laden
            const userTours = await userTourDao.getToursByUser(u.user_id);
            delete userTours.user_id; // user_id entfernen, da bereits im user-Objekt vorhanden
            u.tours = userTours.tours; // Touren dem user-Objekt hinzufügen  
        }

        return res.status(200).json({ message: 'success', data: user});
    } catch (err) {
        console.error('Service Users: Error loading user details:', err);
        return res.status(500).json({ fehler: true, nachricht: err.message });
    }
});

// --- Einzelnen Benutzer abrufen über ID---
serviceRouter.get('/:id', async (req, res) => {
    const usersDao = new UserDao(req.app.locals.dbConnection);
    const userTourDao = new UserTourDao(req.app.locals.dbConnection);
    const { id } = req.params;
    console.log('Service User: Client requested user id=' + id);

    try {
        const user = await usersDao.getUserByID(id);
        if (!user) return res.status(404).json({ fehler: true, nachricht: 'Benutzer nicht gefunden' });

        // Zugeordnete Touren laden
        const userTours = await userTourDao.getToursByUser(id);
        delete userTours.user_id; // user_id entfernen, da bereits im user-Objekt vorhanden
        user.tours = userTours.tours; // Touren dem user-Objekt hinzufügen

        return res.status(200).json({ message: 'success', data: user});
    } catch (err) {
        console.error('Service Users: Error loading user details:', err);
        return res.status(500).json({ fehler: true, nachricht: err.message });
    }
});


// --- Einzelnen Benutzer abrufen über username---
serviceRouter.get('/by-username/:username', async (req, res) => {
    const usersDao = new UserDao(req.app.locals.dbConnection);
    //const userTourDao = new UserTourDao(req.app.locals.dbConnection);
    const { username } = req.params;
    console.log('Service User: Client requested user username=' + username);

    try {
        const user = await usersDao.getUserByUserName(username);
        if (!user) return res.status(404).json({ fehler: true, nachricht: 'Benutzer nicht gefunden' });

        return res.status(200).json({ message: 'success', data: user});
    } catch (err) {
        console.error('Service Users: Error loading user details:', err);
        return res.status(500).json({ fehler: true, nachricht: err.message });
    }
});



// neuen Nutzer erstellen
serviceRouter.post("/", async (req, res) => {
  const { username, address, email, user_role, password_hash, created_at } = req.body;
  const usersDao = new UserDao(req.app.locals.dbConnection);

  try {
    const newUserId = await usersDao.createUser_form({ username, address, email, user_role, password_hash, created_at });
    return res.status(201).json({ message: "Benutzer erfolgreich erstellt", user_id: newUserId });
  } catch (err) {
    console.error("Fehler beim Erstellen des Users:", err.message);
    return res.status(500).json({ fehler: true, nachricht: err.message });
  }
});

// Bestehenden Benutzer aktualisieren
serviceRouter.put('/:id', async (req, res) => {
    const usersDao = new UserDao(req.app.locals.dbConnection);
    const { id } = req.params;
    const { username, address, email, user_role, created_at } = req.body;
    console.log('Service Users: Client requested update of user id=' + id);    
    try {
        const updated = await usersDao.updateUserByID(id, { username, address, email, user_role, created_at }); 
        return res.status(200).json({ message: 'Benutzer aktualisiert', data: updated });
    } catch (err) {
        console.error('Service Users: Error updating user:', err.message);
        return res.status(500).json({ fehler: true, nachricht: 'Fehler beim Aktualisieren des Benutzers' });
    }
});

// Benutzer löschen
serviceRouter.delete('/:id', (req, res) => {
    const usersDao = new UserDao(req.app.locals.dbConnection); 
    const { id } = req.params;
    console.log('Service Users: Client requested deletion of user id=' + id);     
    usersDao.deleteUserByID(id, (err, result) => {
        if (err) {
            console.error('Service Users: Fehler beim Löschen des Users:', err.message);
            return res.status(500).json({ fehler: true, nachricht: err.message });
        }
        if (!result) {
            return res.status(404).json({ fehler: true, nachricht: 'Benutzer nicht gefunden' });
        }
        return res.status(200).json({ message: 'Benutzer gelöscht' });
    });
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
                return res.status(201).json({ message: 'Benutzer registriert' });
            });
        });
    });
});

module.exports = serviceRouter;
