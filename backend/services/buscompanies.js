const express = require('express');
const serviceRouter = express.Router();
const BuscompaniesDao = require('../dao/buscompaniesDao.js');
const helper = require('../helper.js');

console.log('- Service Buscompanies');

// --- Alle Busunternehmen abrufen ---

serviceRouter.get('/', async (req, res) => {
    console.log('Service Buscompanies: Client requested all bus companies');

    try {
        /*
        // Fiktive Bus-Daten
        const buses = [
            { bus_id: 1, bus_seats: 123, company_id: 1 },
            { bus_id: 2, bus_seats: 213, company_id: 2 },
        ];

        */
        const buscompaniesDao = new BuscompaniesDao(req.app.locals.dbConnection);

        const buscompanies = await buscompaniesDao.getAllBuscompanies();
        res.status(200).json({ message: 'success', data: buscompanies });
    } catch (err) {
        console.error('Service Buscompanies: Error loading bus companies', err);
        res.status(500).json({ fehler: true, nachricht: err.message });
    }
});

// --- Einzelnes Busunternehmen abrufen ---
serviceRouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    console.log('Service Buscompanies: Client requested bus company id=' + id);
    const buscompaniesDao = new BuscompaniesDao(req.app.locals.dbConnection);

    try {
        const buscompany = await buscompaniesDao.getBuscompanyById(id);
        res.status(200).json({ message: 'success', data: buscompany });
    } catch (err) {
        console.error('Service Buscompanies: Error loading bus companies:', err.message);
        res.status(404).json({ fehler: true, nachricht: 'Busunternehmen nicht gefunden' });
    }
});

module.exports = serviceRouter;