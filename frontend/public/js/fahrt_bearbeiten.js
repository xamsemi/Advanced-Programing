import * as navbar from './loadNavbar.js';
import { setupLogout,checkLogin } from './checkLogin.js';

let tourId = null;
let allBuses = [];

window.addEventListener('DOMContentLoaded', async () => {
    await navbar.loadNavbar();
    navbar.zeigeAdminBereich();

    const user = await checkLogin(false, true);
    if (!user) return;

    setupLogout();

    // tour_id holen
    const params = new URLSearchParams(window.location.search);
    tourId = params.get("tour_id");

    if (!tourId) {
        alert("Keine Tour-ID gefunden!");
        return;
    }

    // Formular füllen
    await fuelleFormular();
});
// ---- Tour aus API laden ----
async function ladeTour() {
    try {
        const res = await fetch(`/api/tour/${tourId}`, { credentials: "include" });
        if (!res.ok) throw new Error("Fehler beim Laden der Tour");
        const data = await res.json();

        // data.data ist ein Array, wir nehmen das erste Element
        return Array.isArray(data.data) ? data.data[0] : data.data;

    } catch (err) {
        console.error(err);
        alert("Fehler beim Laden der Tour.");
        return null;
    }
}

async function ladeUnternehmen() {
try {
        const res = await fetch("/api/buscompanies", { credentials: "include" });
        const data = await res.json();
        const buscompanies = data.data || [];

        return buscompanies;
    } catch (err) {
        console.error("Fehler beim Laden der Busunternehmen:", err);
        return [];
    }
}

async function ladeBuses() {
    try {
        const res = await fetch("/api/buses", { credentials: "include" });
        const data = await res.json();
        allBuses = data.data || []; // globale Variable füllen
        return allBuses;
    } catch (err) {
        console.error("Fehler beim Laden der Busse:", err);
        allBuses = [];
        return [];
    }
}

function splitDateTime(tourDate) {
    let datum = "";
    let zeit = "";

    if (tourDate.includes("T")) {
        const [d, t] = tourDate.split("T");
        datum = d;
        zeit = t.substring(0, 5);
    } else if (tourDate.includes(" ")) {
        const [d, t] = tourDate.split(" ");
        datum = d;
        zeit = t.substring(0, 5);
    }

    return { datum, zeit };
}

async function fuelleFormular() {
    const tour = await ladeTour();
    if (!tour) return;

    const { datum, zeit } = splitDateTime(tour.tour_date);

    document.getElementById("zielort").value = tour.destination;
    document.getElementById("beschreibung").value = tour.tour_description;
    document.getElementById("datum").value = datum;
    document.getElementById("abfahrt").value = zeit;
    document.getElementById("plaetze").value = tour.bus.bus_seats;

    await fuelleUnternehmenDropdown(tour);

    document.getElementById("tour_id").value = tourId;
}

async function fuelleUnternehmenDropdown(tour) {
    const unternehmenSelect = document.getElementById("unternehmen");
    const plaetzeSelect = document.getElementById("plaetze");

    unternehmenSelect.innerHTML = '<option value="" disabled>Bitte wählen...</option>';
    plaetzeSelect.innerHTML = '<option value="">Bitte wählen...</option>';

    const companies = await ladeUnternehmen();
    await ladeBuses(); // alle Busse laden

    // Unternehmen Optionen aufbauen
    companies.forEach(company => {
        const opt = document.createElement("option");
        opt.value = company.company_id;
        opt.textContent = company.company_name;
        unternehmenSelect.appendChild(opt);
    });

    // Vorauswahl für Unternehmen + Bus
    if (tour.bus && tour.bus.company) {
        unternehmenSelect.value = tour.bus.company.company_id;

        // Busse für die Vorauswahl filtern
        const filteredBuses = allBuses.filter(b => b.company.company_id === tour.bus.company.company_id);
        plaetzeSelect.innerHTML = '';
        filteredBuses.forEach(bus => {
            const opt = document.createElement("option");
            opt.value = bus.bus_id;
            opt.textContent = `${bus.bus_seats} Sitzplätze`;
            if (bus.bus_id === tour.bus.bus_id) opt.selected = true;
            plaetzeSelect.appendChild(opt);
        });
    }

    // Event: Busse filtern, wenn Unternehmen geändert wird
    unternehmenSelect.addEventListener('change', () => {
        const selectedCompanyId = parseInt(unternehmenSelect.value, 10);
        const filteredBuses = allBuses.filter(b => b.company.company_id === selectedCompanyId);

        plaetzeSelect.innerHTML = '<option value="">Bitte wählen...</option>';
        filteredBuses.forEach(bus => {
            const opt = document.createElement("option");
            opt.value = bus.bus_id;
            opt.textContent = `${bus.bus_seats} Sitzplätze`;
            plaetzeSelect.appendChild(opt);
        });

        if (filteredBuses.length === 0) {
            plaetzeSelect.innerHTML = '<option value="">Keine Busse verfügbar</option>';
        }
    });
}

window.submitTourData = async () => {
    const fileInput = document.getElementById('fileInput');
    const tourId = document.getElementById('tour_id').value;

    // Datum + Zeit kombinieren
    const datum = document.getElementById("datum").value;
    const abfahrt = document.getElementById("abfahrt").value;
    const tour_date = `${datum} ${abfahrt}`;

    // Bus + Unternehmen
    const busSelect = document.getElementById('plaetze');
    const companySelect = document.getElementById('unternehmen');

    // FormData erstellen
    const fd = new FormData();
    fd.append('tour_description', document.getElementById("beschreibung").value);
    fd.append('tour_date', tour_date);
    fd.append('destination', document.getElementById("zielort").value);
    fd.append('bus_id', parseInt(busSelect.value, 10));
    fd.append('company_id', parseInt(companySelect.value, 10));

    // Bild nur anhängen, wenn eins ausgewählt wurde
    if (fileInput.files.length > 0) {
        fd.append('coverimage', fileInput.files[0]);
    }

    try {
        const res = await fetch(`/api/tour/${tourId}`, {   // PUT direkt auf tour_id
            method: 'PUT',
            body: fd,
            credentials: 'include'
        });

        const data = await res.json();
        if (res.ok) {
            alert('Fahrt erfolgreich bearbeitet!');
            window.location.href = 'admin_fahrten.html';
        } else {
            console.error('Fehler beim Bearbeiten:', data);
            alert('Fehler beim Bearbeiten der Fahrt.');
        }

    } catch (err) {
        console.error('Fehler beim Speichern:', err);
        alert('Fehler beim Bearbeiten der Fahrt.');
    }

    return false; // Default-Form verhindern
};