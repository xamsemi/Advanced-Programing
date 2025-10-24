//const bcrypt = require('bcrypt');
const express = require('express');
const session = require('express-session');
//const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');

const port = 3000;
const app = express();

/****************************************************/
// Database connection
const Database = require('mysql2');
// Connect to MySQL database        
try {
    db = new Database.createConnection({
        host: 'mysql', //oder 'localhost' wenn lokal
        user: 'root',
        password: 'my-secret-pw',
        database: 'busfahrt_app'
    });
    console.log('Connected to MySQL database.');
} catch (err) {
    console.error('Database opening error: ', err);
}
app.locals.dbConnection = db; // Globale Verfügbarkeit der DB-Verbindung
/****************************************************/

// --- Middleware ---
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({ 
    secret: "geheimesessionkey", 
    resave: false, 
    saveUninitialized: false }));

/********************************************************* */
// --- Swagger Setup ---
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
/*
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Test Login API",
      version: "1.0.0",
      description: "Backend mit Registrierung, Login, Nachrichten und Session-Test"
    },
    servers: [
      { url: "http://localhost:3000" }
    ]
  },
  apis: ["./server.js"], // <- Pfad zu dieser Datei
};
const swaggerSpecs = swaggerJsdoc(swaggerOptions);
/********************************************************* */
/* Swagger UI Setup */
const swaggerDocument = require('./swagger-output.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/*********************************** */
//Routen zu den Services
/*********************************** */
//app.use('/api/tour', require('./services/'));
app.use('/api/user', require('./services/user'));

/*
// --- In-Memory-Daten ---
const users = []; // Array für User
const SALT_ROUNDS = 10;

// --- Rate Limiting (gegen Brute Force) ---
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 Minute
  max: 5,
  message: "Zu viele Login-Versuche. Bitte warte eine Minute.",
});
app.use("/api/login", loginLimiter);
/**
 * 
 * @swagger
 * /api/register:
 *   post:
 *     summary: Registriert einen neuen Benutzer
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "max"
 *               password:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       201:
 *         description: Benutzer erfolgreich registriert
 *       400:
 *         description: Benutzer existiert bereits oder Eingaben fehlen
 */
/*
// Benutzer registrieren
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) 
    return res.status(400).json({ message: 'Username & Passwort erforderlich' });

  // Prüfen, ob Benutzer existiert
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Benutzer existiert bereits' });
  }
  // Passwort hashen
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Benutzer speichern
  users.push({ username, passwordHash });
  console.log("Registrierte Benutzer:", users);
  res.status(201).json({ message: 'Benutzer registriert' });
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Loggt einen Benutzer ein
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "max"
 *               password:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Login erfolgreich
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Falscher Benutzername oder Passwort
 */
/*
// Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Empfangen:", username, password);
   const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(400).json({ message: "Falscher Benutzername" });
  } 
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(400).json({ message: "Falsches Passwort" });
  } 
  req.session.userId = username; // Session setzen
  res.json({ message: "Login erfolgreich" });
  
});

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Loggt den Benutzer aus
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout erfolgreich
 */
/* Logout
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logout erfolgreich" });
  });
});

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Gibt das Benutzerprofil zurück
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: Profil erfolgreich abgerufen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *       401:
 *         description: Nicht eingeloggt
 */
/*
// --- Session-Test --- noch nicht umgesetzt
app.get('/api/profile', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Nicht eingeloggt' });
  res.json({ username: req.session.userId });
});
/**
 * @swagger
 * /api/message:
 *   post:
 *     summary: Nachricht senden
 *     tags:
 *       - Chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Hallo!"
 *     responses:
 *       200:
 *         description: Nachricht empfangen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 reply:
 *                   type: string
 */

// Endpoint, der Nachrichten empfängt
app.post('/api/message', (req, res) => {
    const { text } = req.body;  
    console.log('Nachricht erhalten:', text);
    let reply;
    if (text.toLowerCase().includes('feierabend')) {
        reply = 'na klar erholung muss auch sein :-).';
    } else if (text.toLowerCase().includes('danke')) {
        reply = 'Bis bald.';
    } else {
        reply = `Deine Nachricht war: "${text}"`;
    }
    res.json({ status: 'success', reply });
});


// Server starten
app.listen(port, () => {
    console.log(`Backend läuft auf http://localhost:${port}`);
    console.log(`Swagger Docs: http://localhost:${port}/api-docs`);
});