const express = require('express');
const serviceRouter = express.Router();
const BusesDao = require('../dao/busesDao.js');
const BuscompaniesDao = require('../dao/buscompaniesDao.js');
const helper = require('../helper.js');

console.log('- Service Buses');

// --- Alle Busse abrufen ---
serviceRouter.get('/', async (req, res) => {
    console.log('Service Buses: Client requested all buses');
    try {
        const busesDao = new BusesDao(req.app.locals.dbConnection);
        const buses = await busesDao.getAllBuses();
        res.status(200).json({ message: 'success', data: buses });
    } catch (err) {
        console.error('Service Buses: Error loading buses', err);
        res.status(500).json({ fehler: true, nachricht: err.message });
    }
});

// --- Einzelnen Bus abrufen ---
serviceRouter.get('/:bus_id', async (req, res) => {

    const { bus_id } = req.params;
    console.log('Service Buses: Client requested bus id=' + bus_id);
    const busesDao = new BusesDao(req.app.locals.dbConnection);
    try {
        const bus = await busesDao.getBusById(bus_id);
        console.log("Gefundene Company ID:", bus.company_id);
        return res.status(200).json({ message: 'success', data: bus });
    } catch (err) {
        console.error('Service Buses: Error loading buses:', err.message);
        return res.status(404).json({ fehler: true, nachricht: 'Bus nicht gefunden' });
    }
});

// neuen Bus erstellen
serviceRouter.post("/", async (req, res) => {
    const { bus_seats, company_id } = req.body;
    const busesDao = new BusesDao(req.app.locals.dbConnection);

    try {
        const newBusId = await busesDao.createBus({ bus_seats, company_id });
        return res.status(201).json({ message: "Bus erfolgreich erstellt", bus_id: newBusId });
    } catch (err) {
        console.error("Fehler beim Erstellen des Busses:", err.message);
        return res.status(500).json({ fehler: true, nachricht: err.message });
    }
});


//Update Bus
serviceRouter.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { bus_seats} = req.body;
    const busesDao = new BusesDao(req.app.locals.dbConnection);
    console.log("DB vorhanden?", req.app.locals.dbConnection ? "JA" : "NEIN");
    try {
        const newBusId = await busesDao.updateBus(id, { bus_seats });
        return res.status(200).json({ message: "Bus erfolgreich geändert", bus_id: newBusId.bus_id });
    } catch (err) {
        console.error("Fehler beim Ändern des Busses:", err.message);
        return res.status(500).json({ fehler: true, nachricht: err.message });
    }
});

serviceRouter.delete('/:id', (req, res) => {
    const { id } = req.params;
    console.log('Service Buses: Client requested deletion of bus id=' + id);
    const busesDao = new BusesDao(req.app.locals.dbConnection);

    busesDao.deleteBus(id, (err, result) => {
        if (err) {
            console.error('Service Buses: Error deleting bus:', err.message);
            return res.status(500).json({ fehler: true, nachricht: err.message });
        }
        return res.status(200).json({ message: 'Bus erfolgreich gelöscht' });
    });
});

module.exports = serviceRouter;