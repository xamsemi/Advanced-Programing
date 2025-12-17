const express = require('express');
const serviceRouter = express.Router();
const TourDao = require('../dao/tourDao.js');
const BusesDao = require('../dao/busesDao.js');
const BuscompaniesDao = require('../dao/buscompaniesDao.js');
const helper = require('../helper.js');
const upload = require('./upload.js');

console.log('- Service Tour');

const imageServerPath = './img/tours/';

// helper: gemeinsame Update-Logik
async function performUpdate(req, res, id, fileNameCoverImage) {
    const { tour_description, tour_date, destination, bus_id, company_id } = req.body;

    const busIdNum = bus_id ? parseInt(bus_id, 10) : null;
    const companyIdNum = company_id ? parseInt(company_id, 10) : null;

    if (!busIdNum || !companyIdNum) {
        return res.status(400).json({ fehler: true, nachricht: 'Bitte Bus und Unternehmen auswählen' });
    }

    const tourDao = new TourDao(req.app.locals.dbConnection);
    const busesDao = new BusesDao(req.app.locals.dbConnection);

    try {
        // Prüfen, ob Tour existiert
        const tourExists = await tourDao.getTourById(id);
        if (!tourExists) {
            return res.status(404).json({ fehler: true, nachricht: 'Die Tour existiert nicht.' });
        }

        // Prüfen, ob Bus existiert
        const bus = await busesDao.getBusById(busIdNum);
        if (!bus) {
            return res.status(400).json({ fehler: true, nachricht: 'Der ausgewählte Bus existiert nicht.' });
        }

        // Prüfen, ob Bus zur Firma gehört
        if (!bus.company || bus.company.company_id !== companyIdNum) {
            return res.status(400).json({ fehler: true, nachricht: 'Der Bus gehört nicht zur gewählten Firma.' });
        }

        // Logging
        console.log('Updating tour with:', {
            tour_id: id,
            tour_description,
            tour_date,
            destination,
            bus_id: busIdNum,
            picture_path: fileNameCoverImage
        });

        // Update ohne company_id
        const updated = await tourDao.updateTour(id, {
            picture_path: fileNameCoverImage,
            tour_description,
            tour_date,
            destination,
            bus_id: busIdNum
        });

        if (updated) {
            return res.status(200).json({ message: 'Tour erfolgreich aktualisiert' });
        } else {
            return res.status(500).json({ fehler: true, nachricht: 'Fehler beim Aktualisieren der Tour' });
        }

    } catch (err) {
        console.error('Service Tour: Error updating tour:', err);
        return res.status(500).json({ fehler: true, nachricht: 'Fehler beim Aktualisieren der Tour' });
    }
}

// --- Alle Touren abrufen ---
serviceRouter.get('/', async (req, res) => {
    console.log('Service Tour: Client requested all tours');
    const tourDao = new TourDao(req.app.locals.dbConnection);
    try {
        const tours = await tourDao.getAllTours();
        console.log('Service Tour: Retrieved tours:', tours);

        return res.status(200).json({ message: 'success', data: tours });
    } catch (err) {
        console.error('Service Tour: Error loading tours', err);
        return res.status(500).json({ fehler: true, nachricht: err.message });
    }
});

// --- Einzelne Tour abrufen ---
serviceRouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    console.log('Service Tour: Client requested tour id=' + id);
    const tourDao = new TourDao(req.app.locals.dbConnection);
    try {
        var tour = await tourDao.getTourById(id);
        // tour.forEach(tour => {
        //     var picture_name = tour.picture_path
        //     delete tour.picture_path;
        //     tour.picture_url = imageServerPath + picture_name;
        // });
        console.log('Service Tour: Retrieved tour:', tour);
        res.status(200).json({ message: 'success', data: tour });
    } catch (err) {
        console.error('Service Tour: Error loading tour:', err.message);
        res.status(404).json({ fehler: true, nachricht: 'Tour nicht gefunden' });
    }
});

// --- Tour hinzufügen ---
// multer manuell aufrufen, damit wir nach dem Upload entscheiden können (create oder override->update)
serviceRouter.post("/", async (req, res) => {
    upload.single('coverimage')(req, res, async (err) => {
        if (err) {
            console.error('Upload error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ fehler: true, nachricht: 'Datei zu groß' });
            }
            return res.status(400).json({ fehler: true, nachricht: err.message || 'Upload-Fehler' });
        }

        console.log("POST Request Body:", req.body);
        console.log("POST File:", req.file);

        const fileNameCoverImage = req.file ? req.file.filename : null;

        // POST enthält _method=put -> Update ausführen (multipart: body ist jetzt verfügbar)
        if (req.body._method && req.body._method.toLowerCase() === 'put') {
            const tour_id = req.body.tour_id || req.body.id;
            if (!tour_id) return res.status(400).json({ fehler: true, nachricht: 'Tour-ID fehlt' });
            return await performUpdate(req, res, tour_id, fileNameCoverImage);
        }

        // normale Create-Logik
        try {
            const { tour_description, tour_date, destination, bus_id } = req.body;
            const tourDao = new TourDao(req.app.locals.dbConnection);

            const newId = await tourDao.createTour(
                tour_description,
                tour_date,
                destination,
                bus_id,
                fileNameCoverImage
            );

            res.status(201).json({
                message: "Tour erfolgreich erstellt",
                id: newId
            });

        } catch (err2) {
            console.error("Service Tour: Fehler beim Anlegen:", err2);
            res.status(500).json({ error: "Fehler beim Erstellen der Tour." });
        }
    });
});

// --- Tour aktualisieren ---
serviceRouter.put('/:tour_id', upload.single('coverimage'), async (req, res) => {
    const id = req.params.tour_id; // use same param name
    const fileNameCoverImage = req.file ? req.file.filename : null;
    return await performUpdate(req, res, id, fileNameCoverImage);
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

module.exports = serviceRouter;