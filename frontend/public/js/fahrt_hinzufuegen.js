import * as navbar from './loadNavbar.js';
import { checkLogin, setupLogout } from './checkLogin.js';

window.addEventListener('DOMContentLoaded', async () => {

    // Navbar laden & Admin Bereich anzeigen
    await navbar.loadNavbar();
    navbar.zeigeAdminBereich();

    const saveButton = document.getElementById("saveButton");
    const companySelect = document.getElementById('busUnternehmen');
    const busSelect = document.getElementById('plaetze');
    const form = document.querySelector("form");

    console.log("Form gefunden:", form);

    if (!saveButton || !companySelect || !busSelect) {
        console.error("Ein benötigtes DOM-Element existiert nicht!");
        return; // Abbruch, wenn irgendwas fehlt
    }

    // Login prüfen
    const user = await checkLogin(false, true);
    if (user) setupLogout();

    // Busunternehmen laden
    async function ladeBusunternehmen() {
        try {
            const res = await fetch('/api/buscompanies', { credentials: "include" });
            const json = await res.json();
            companySelect.innerHTML = '<option value="">Bitte auswählen</option>';
            json.data.forEach(c => {
                const option = document.createElement('option');
                option.value = c.company_id;
                option.textContent = c.company_name;
                companySelect.appendChild(option);
            });
        } catch (err) {
            console.error(err);
        }
    }

    await ladeBusunternehmen();

    // Busse laden
    let allBuses = [];
    async function ladeBuses() {
        try {
            const res = await fetch('/api/buses', { credentials: "include" });
            const json = await res.json();
            allBuses = json.data;
            console.log("Geladene Busse:", allBuses);
        } catch (err) {
            console.error(err);
        }
    }

    await ladeBuses();

    // Event: Busse filtern nach Unternehmen
    companySelect.addEventListener('change', () => {
        const companyId = parseInt(companySelect.value, 10);
        const filtered = allBuses.filter(bus => bus.company.company_id === companyId);
        busSelect.innerHTML = '<option value="">Bitte wählen...</option>';
        filtered.forEach(bus => {
            const opt = document.createElement('option');
            opt.value = bus.bus_id;
            opt.textContent = `${bus.bus_seats} Sitzplätze`;
            busSelect.appendChild(opt);
        });
        if (filtered.length === 0) busSelect.innerHTML = '<option value="">Keine Busse verfügbar</option>';
    });

    // Save Button Event
    saveButton.addEventListener('click', async e => {
        e.preventDefault();

        // Datum + Uhrzeit zusammenbauen
        const datum = document.getElementById("datum").value;          // "YYYY-MM-DD"
        const abfahrtszeit = document.getElementById("abfahrtszeit").value; // z.B. "13:28"
        const tour_date = `${datum} ${abfahrtszeit}`;
        const busSelect = document.getElementById('plaetze');
        const companySelect = document.getElementById('busUnternehmen');
        const fileInput = document.getElementById('fileInput');

        const fd = new FormData();
        fd.append('tour_description', document.getElementById("beschreibung").value);
        fd.append('tour_date', tour_date);
        fd.append('destination', document.getElementById("ziel").value);
        fd.append('bus_id', parseInt(busSelect.value, 10));
        fd.append('company_id', parseInt(companySelect.value, 10)); // falls Backend erwartet
        if (fileInput.files.length > 0) fd.append('coverimage', fileInput.files[0]);

        try {
            const res = await fetch('/api/tour/', {
                method: 'POST',
                body: fd,
                credentials: 'include'
            });
            const data = await res.json();
            console.log(res.ok ? 'Fahrt erfolgreich gespeichert' : 'Fehler beim Speichern', data);
        } catch (err) {
            console.error(err);
        }
    });

});