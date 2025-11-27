/****************************************************/
/* Config */
/****************************************************/
console.log('Starting server...');

const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
//Pfad zur public Mappe


const port = 3000;
const app = express();

// --- Database connection ---
const Database = require('mysql2');
// Create connection instance
db = new Database.createConnection({
  host: 'mysql', // oder 'localhost' wenn lokal
  user: 'root',
  password: 'my-secret-pw',
  database: 'busfahrt_app'
});

// --- Retry-Funktion für DB ---
function connectWithRetry(db, retries = 10, delay = 3000) {
  return new Promise((resolve, reject) => {
    let attempt = 0;
    const tryConnect = () => {
      db.connect((err) => {
        if (!err) {
          console.log('- Connected to MySQL database');
          resolve();
        } else {
          attempt++;
          if (attempt >= retries) {
            reject(err);
          } else {
            console.log(`🔁 Versuch ${attempt}/${retries} fehlgeschlagen: ${err.code || err.message}. Retry in ${delay}ms`);
            setTimeout(tryConnect, delay);
          }
        }
      });
    };
    tryConnect();
  });
}

// --- Middleware ---
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({ 
    secret: "geheimesessionkey", 
    resave: false, 
    saveUninitialized: false 
  })
);

// --- Swagger Setup ---
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// --- Default Endpoint ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

// --- Server starten, sobald DB bereit ist ---
connectWithRetry(db)
  .then(() => {
    app.locals.dbConnection = db;

    // --- Services ---
    app.use('/api/user', require('./services/user.js'));
    app.use('/api/tour', require('./services/tour'));
    app.use('/api/buses', require('./services/buses.js'));
    app.use('/api/buscompanies', require('./services/buscompanies.js'));

    app.listen(port, () => {
      console.log(`Backend läuft auf http://localhost:${port}`);
      console.log(`Swagger Docs: http://localhost:${port}/api-docs`);
    });
  })
  .catch((err) => {
    console.error('## Error starting server:', err.code || err.message || err);
    console.error(err.stack)
    console.error('Could not start server. Exiting.');
    app.locals.dbConnection = null;
  });