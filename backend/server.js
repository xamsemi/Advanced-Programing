const express = require('express');
const session = require('express-session');
const argon2 = require('argon2');
const helmet = require('helmet');
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.json());

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
// Endpoint, der Nachrichten empfängt
app.post('/nginx/restart', (req, res) => {
    console.log('NginX');

});


// Server starten
app.listen(port, () => {
    console.log(`Backend läuft auf http://localhost:${port}`);
});