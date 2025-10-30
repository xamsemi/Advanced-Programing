const express = require('express');
const serviceRouter = express.Router();
const TourDao = require('../dao/tourDao.js');
const helper = require('../helper.js');

console.log('- Service Tour');

// --- Alle Touren abrufen ---
serviceRouter.get('/tours', async (req, res) => {
    console.log('Service Tour: Client requested all tours');

    try {
        // Fiktive Touren-Daten
        const tours = [
            { tour_id: 1, tour_name: 'Umzug Reutlingen', tour_description: 'Traditioneller Umzug in Reutlingen', tour_date: '2026-01-15', destination: 'Reutlingen' },
            { tour_id: 2, tour_name: 'Umzug Rangendingen', tour_description: 'Traditioneller Umzug in Rangendingen', tour_date: '2026-01-16', destination: 'Rangendingen' },
        ];

        res.status(200).json({ message: 'success', data: tours });
    } catch (err) {
        console.error('Service Tour: Error loading tours', err);
        res.status(500).json({ fehler: true, nachricht: err.message });
    }
});

// --- Einzelne Tour abrufen ---
serviceRouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    console.log('Service Tour: Client requested tour id=' + id);
    const tourDao = new TourDao(req.app.locals.dbConnection);

    try {
        const tour = await tourDao.loadById(id);
        res.status(200).json({ message: 'success', data: tour });
    } catch (err) {
        console.error('Service Tour: Error loading tour:', err.message);
        res.status(404).json({ fehler: true, nachricht: 'Tour nicht gefunden' });
    }
});

module.exports = serviceRouter;