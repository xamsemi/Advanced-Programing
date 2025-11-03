/****************************************************/
/* Config */
/****************************************************/
console.log('Starting server...');


const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
//Pfad zur public Mappe
const path = require('path'); // 🟢 für den Pfad zur public-Mappe

const port = 3000;
const app = express();


// Database connection
const Database = require('mysql2');
// Connect to MySQL database        
db = new Database.createConnection({
  host: 'mysql', //oder 'localhost' wenn lokal
  user: 'root',
  password: 'my-secret-pw',
  database: 'busfahrt_app'
});


// --- Middleware ---
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({ 
    secret: "geheimesessionkey", 
    resave: false, 
    saveUninitialized: false }));


// Diese Zeile erlaubt es, HTML/CSS/JS aus /public zu laden, angepasst!
app.use(express.static(path.join(__dirname, 'public')));

// --- Swagger Setup ---
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

/* Swagger UI Setup */
const swaggerDocument = require('./swagger-output.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


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


// Use explicit connect callback to catch immediate connection errors
db.connect((err) => {
  if (err) {
    console.error('- MySQL connect error:', err.code || err.message || err);
    // mark app.locals.dbConnection as null so services can react
    app.locals.dbConnection = null;
      console.error('Datenbankverbindung nicht verfügbar. Server wird nicht gestartet.');
  } else {
    console.log('- Connected to MySQL database.');
    app.locals.dbConnection = db; // set only after successful connect

    
    //Routen zu den Services
    app.use('/api/user', require('./services/user'));
    app.use('/api/tour', require('./services/tour'));
    /*hinzugefuegt*/
    app.use('/api/buses', require('./services/buses.js'));



    app.listen(port, () => {
      console.log(`Backend läuft auf http://localhost:${port}`);
      console.log(`Swagger Docs: http://localhost:${port}/api-docs`);
  });
  }
});