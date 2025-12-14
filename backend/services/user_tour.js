const express = require('express');
const serviceRouter = express.Router();
const UserTourDao = require('../dao/userTourDao.js');

const helper = require('../helper.js');

console.log('- Service User_tour');

// --- Alle User_Tours abrufen ---
serviceRouter.get('/:user_id', async (req, res) => {
    const { user_id } = req.params;
    console.log('Service User_tour: Client requested all user_tours for user_id=' + user_id);
    try {
        const user_tourDao = new UserTourDao(req.app.locals.dbConnection);
        const user_tours = await user_tourDao.getToursByUser(user_id);
        return res.status(200).json({ message: 'success', data: user_tours });
    } catch (err) {
        console.error('Service User_tour: Error loading user_tours', err);
        return res.status(500).json({ fehler: true, nachricht: err.message });
    }
});

// --- Alle User_Tours simple abrufen ---
serviceRouter.get('/simple/:user_id', async (req, res) => {
    const { user_id } = req.params;
    console.log('Service User_tour: Client requested all user_tours for user_id=' + user_id);
    try {
        const user_tourDao = new UserTourDao(req.app.locals.dbConnection);
        const user_tours = await user_tourDao.getToursByUserSimple(user_id);
        return res.status(200).json({ message: 'success', data: user_tours });
    } catch (err) {
        console.error('Service User_tour: Error loading user_tours', err);
        return res.status(500).json({ fehler: true, nachricht: err.message });
    }
});




// Buchung erstellen
serviceRouter.post("/", async (req, res) => {
    const { user_id, tour_id } = req.body;
    const userTourDao = new UserTourDao(req.app.locals.dbConnection);

    try {
        const newUserTourId = await userTourDao.bookTour( user_id, tour_id );
        return res.status(201).json({ message: "Buchung erfolgreich erstellt", user_tour_id: newUserTourId });
    } catch (err) {
        console.error("Fehler beim Erstellen der Buchung:", err.message);
        return res.status(500).json({ fehler: true, nachricht: err.message });
    }
});

// Buchung stornieren   
serviceRouter.delete("/:user_id/:tour_id", async (req, res) => {
    const { user_id, tour_id } = req.params;
    const userTourDao = new UserTourDao(req.app.locals.dbConnection);

    try {
        await userTourDao.cancelBooking(user_id, tour_id);
        return res.status(200).json({ message: "Buchung erfolgreich storniert" });
    } catch (err) {
        console.error("Fehler beim Stornieren der Buchung:", err.message);
        return res.status(500).json({ fehler: true, nachricht: err.message });
    }
});


module.exports = serviceRouter;