const express = require('express');
const serviceRouter = express.Router();
const TourDao = require('../dao/busesDao.js');
const helper = require('../helper.js');

console.log('- Service Buses');

// --- Alle Busse abrufen ---
serviceRouter.get('/buses', async (req, res) => {
    console.log('Service Buses: Client requested all buses');

    try {
        // Fiktive Touren-Daten
        const buses = [
            { buses_id: 1, bus_seats: 123, company_id: 1 },
            { buses_id: 2, bus_seats: 213, company_id: 2 },
        ];

        res.status(200).json({ message: 'success', data: buses });
    } catch (err) {
        console.error('Service Buses: Error loading buses', err);
        res.status(500).json({ fehler: true, nachricht: err.message });
    }
});

// --- Einzelne Bus abrufen ---
serviceRouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    console.log('Service Buses: Client requested bus id=' + id);
    const busesDao = new BusesDao(req.app.locals.dbConnection);

    try {
        const buses = await busesDao.loadById(id);
        res.status(200).json({ message: 'success', data: buses });
    } catch (err) {
        console.error('Service Buses: Error loading buses:', err.message);
        res.status(404).json({ fehler: true, nachricht: 'Bus nicht gefunden' });
    }
});

module.exports = serviceRouter;