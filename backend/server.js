const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const port = 3000;
const app = express();


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


// --- Middleware ---
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({ 
    secret: "geheimesessionkey", 
    resave: false, 
    saveUninitialized: false }));


// --- Swagger Setup ---
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

/* Swagger UI Setup */
const swaggerDocument = require('./swagger-output.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


//Routen zu den Services
app.use('/api/user', require('./services/user'));

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