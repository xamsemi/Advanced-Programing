const express = require('express');
const app = express();
const port = 3000;

// JSON body parser
app.use(express.json());

// Endpoint, der Nachrichten empfängt
app.post('/message', (req, res) => {
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

app.listen(port, () => {
    console.log(`Backend läuft auf http://localhost:${port}`);
});