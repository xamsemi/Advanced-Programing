import * as navbar from './loadNavbar.js';
import { setupLogout, checkLogin } from './checkLogin.js';

window.addEventListener('DOMContentLoaded', async () => {
    // Navbar laden & Login prüfen
    await navbar.loadNavbar();
    const user = await checkLogin(false, true);
    navbar.zeigeAdminBereich(user);

    if (user) setupLogout();
    console.log("DOM geladen");
    //konfetti
    startFallingConfetti();


    // Dropdown für Busunternehmen füllen
    const select = document.getElementById('busunternehmen');
    if (select) {
        try {
            const res = await fetch('/api/buscompanies', { credentials: 'include' });
            if (!res.ok) throw new Error('Fehler beim Laden der Busunternehmen');

            const result = await res.json(); // { message, data }
            const companies = result.data;

            companies.forEach(company => {
                const option = document.createElement('option');
                option.value = company.company_id;       // ID als Wert
                option.textContent = company.company_name; // Name als Text
                select.appendChild(option);
            });
        } catch (err) {
            console.error('Fehler beim Laden der Busunternehmen:', err);
            alert('Konnte die Busunternehmen nicht laden.');
        }
    }

    // Formular-Submit
    const form = document.getElementById('bus_hinzufuegen_form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Verhindert Seitenreload

        const companyId = select.value;
        const seats = document.getElementById('sitzplaetze').value.trim();

        // Validierung
        if (!companyId || !seats) {
            alert('Bitte Busunternehmen auswählen und Sitzplätze angeben.');
            return;
        }

        const newBus = {
            company_id: parseInt(companyId),
            bus_seats: parseInt(seats)
        };

        try {
            const response = await fetch('/api/buses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newBus)
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Fehler beim Speichern des Busses: ${text}`);
            }

            alert('Bus erfolgreich gespeichert!');
            form.reset();
        } catch (err) {
            console.error('Fehler beim Speichern des Busses:', err);
            alert('Fehler beim Speichern des Busses.');
        }
    });

    
});
/*konfetti Funktion*/
function startFallingConfetti() {
    console.log("Starte Konfetti");
    const canvas = document.getElementById("confetti-canvas");
    console.log("Canvas gefunden:", canvas);
    console.log("Konfetti Objekt:", typeof confetti);
    const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true
  });

    const duration = 4000; // 4 Sekunden
    const end = Date.now() + duration;

    (function frame() {
        myConfetti({
        particleCount: 4,
        angle: 90,
        spread: 55,
        origin: { x: Math.random(), y: 0 }
        });

        if (Date.now() < end) {
        requestAnimationFrame(frame);
        }
    })();
}
