const express = require('express');
const serviceRouter = express.Router();
const BusesDao = require('../dao/busesDao.js');
const helper = require('../helper.js');

console.log('- Service Buses');

// --- Alle Busse abrufen ---
//serviceRouter.get('/buses', async (req, res) => {
serviceRouter.get('/', async (req, res) => {
    console.log('Service Buses: Client requested all buses');

    try {
        /*
        // Fiktive Bus-Daten
        const buses = [
            { bus_id: 1, bus_seats: 123, company_id: 1 },
            { bus_id: 2, bus_seats: 213, company_id: 2 },
        ];

        */
       const busesDao = new BusesDao(req.app.locals.dbConnection);

        const buses = await busesDao.getAllBuses();
        res.status(200).json({ message: 'success', data: buses });
    } catch (err) {
        console.error('Service Buses: Error loading buses', err);
        res.status(500).json({ fehler: true, nachricht: err.message });
    }
});

// --- Einzelnen Bus abrufen ---
serviceRouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    console.log('Service Buses: Client requested bus id=' + id);
    const busesDao = new BusesDao(req.app.locals.dbConnection);

    try {
        const buses = await busesDao.getBusById(id);
        res.status(200).json({ message: 'success', data: buses });
    } catch (err) {
        console.error('Service Buses: Error loading buses:', err.message);
        res.status(404).json({ fehler: true, nachricht: 'Bus nicht gefunden' });
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

serviceRouter.post("/", async (req, res) => {
  const { bus_seats, company_id } = req.body;
  const busesDao = new BusesDao(req.app.locals.dbConnection);

  try {
    const newBusId = await busesDao.createBus({ bus_seats, company_id });
    res.status(201).json({ message: "Bus erfolgreich erstellt", bus_id: newBusId });
  } catch (err) {
    console.error("Fehler beim Erstellen des Busses:", err.message);
    res.status(500).json({ fehler: true, nachricht: err.message });
  }
});



module.exports = serviceRouter;