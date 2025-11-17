const express = require('express');
const serviceRouter = express.Router();
const TourDao = require('../dao/tourDao.js');
const helper = require('../helper.js');

console.log('- Service Tour');

// --- Alle Touren abrufen ---
serviceRouter.get('/tours', async (req, res) => {
    console.log('Service Tour: Client requested all tours');
    const tourDao = new TourDao(req.app.locals.dbConnection);

    try {
        const tours = await tourDao.getAllTours();
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
        const tour = await tourDao.getTourById(id);
        res.status(200).json({ message: 'success', data: tour });
    } catch (err) {
        console.error('Service Tour: Error loading tour:', err.message);
        res.status(404).json({ fehler: true, nachricht: 'Tour nicht gefunden' });
    }
});

// --- Einzelne Tour löschen ---
serviceRouter.delete('/:id', async (req, res) => {
    const { id } = req.params;
    console.log('Service Tour: Delete requested for tour id=' + id);
    const tourDao = new TourDao(req.app.locals.dbConnection);

    try {
        const deleted = await tourDao.deleteTour(id);
        if (deleted) {
            res.status(200).json({ message: 'Tour erfolgreich gelöscht' });
        } else {
            res.status(404).json({ fehler: true, nachricht: 'Tour nicht gefunden' });
        }
    } catch (err) {
        console.error('Service Tour: Error deleting tour:', err.message);
        res.status(500).json({ fehler: true, nachricht: 'Fehler beim Löschen der Tour' });
    }
});

// --- Tour hinzugügen ---
serviceRouter.post("/tours", async (req, res) => {
    console.log("POST Request Body:", req.body);

    const { tour_description, tour_date, destination, bus_id, picture_path } = req.body;
    const tourDao = new TourDao(req.app.locals.dbConnection);

    try {
        const newId = await tourDao.createTour(
            tour_description,
            tour_date,
            destination,
            bus_id,
            picture_path
        );

        res.status(201).json({
            message: "Tour erfolgreich erstellt",
            id: newId
        });

    } catch (err) {
        console.error("Service Tour: Fehler beim Anlegen:", err);
        res.status(500).json({ error: "Fehler beim Erstellen der Tour." });
    }
});

module.exports = serviceRouter;