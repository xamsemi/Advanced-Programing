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

// neuen Busunternehmen erstellen
serviceRouter.post("/", async (req, res) => {
  const { company_name, contact_info, company_email } = req.body;
  const buscompaniesDao = new BuscompaniesDao(req.app.locals.dbConnection);

  try {
    const newCompanyId = await buscompaniesDao.createBuscompany({ company_name, contact_info, company_email });
    res.status(200).json({ message: "Busunternehmen erfolgreich erstellt", company_id: newCompanyId });
  } catch (err) {
    console.error("Fehler beim Erstellen des Busunternehmens:", err.message);
    res.status(500).json({ fehler: true, nachricht: err.message });
  }
});

//Update Busunternehmen
serviceRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { company_name, contact_info, company_email } = req.body;
  const buscompaniesDao = new BuscompaniesDao(req.app.locals.dbConnection);
  console.log("DB vorhanden?", req.app.locals.dbConnection ? "JA" : "NEIN");
  try {
    const newCompanyId = await buscompaniesDao.updateBuscompany(id, { company_name, contact_info, company_email });
    res.status(200).json({ message: "Busunternehmen erfolgreich geändert", company_id: newCompanyId.company_id });
  } catch (err) {
    console.error("Fehler beim Ändern des Busunternehmens:", err.message);
    res.status(500).json({ fehler: true, nachricht: err.message });
  }
});



module.exports = serviceRouter;