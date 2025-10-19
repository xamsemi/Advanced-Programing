/****************************************************/
/* Config */
/****************************************************/
console.log('Starting server...');

// Import required modules
const express = require('express');
const swaggerDocument = require('./swagger-output.json');
const swaggerUi = require('swagger-ui-express');

const app = express();

// Middleware
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Backend läuft auf http://localhost:${port}`);
});