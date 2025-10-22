/****************************************************/
/* Config */
/****************************************************/
console.log('Starting server...');

// Import required modules
const express = require('express');
const app = express();

// Middleware
app.use(express.json());

//Swagger Config
const swaggerDocument = require('./swagger-output.json');
const swaggerUi = require('swagger-ui-express');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/****************************************************/
// Database connection
const Database = require('mysql2');
// Connect to MySQL database        
try {
    db = new Database.createConnection({
        host: 'localhost',
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

//app.use('/api/fahrt', require('./services/fahrt'));
app.use('/api/user', require('./services/user'));

// Endpoint, der Nachrichten empfängt
app.post('/api/message', (req, res) => {
    const { text } = req.body;  // <-- hier lesen wir den Body aus
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
const port = 3000;
app.listen(port, () => {
    console.log(`Backend läuft auf http://localhost:${port}`);
});