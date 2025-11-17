import { loadNavbar } from './loadNavbar.js';
import { checkLogin, setupLogout } from './checkLogin.js';
loadNavbar();



window.addEventListener('DOMContentLoaded', async () => {
    const saveButton = document.getElementById("saveButton");
    const form = document.querySelector("form");
    console.log("Form gefunden:", form);
    // Prüfe Login-Status – leite weiter falls ausgeloggt
    const user = await checkLogin(false, true);
    console.log("geladen");
    // Nur laden, wenn Benutzer eingeloggt ist
    if (user) {
        setupLogout();
        if(user.role === 'admin') {
         
        }
    }
    setupLogout();
    saveButton.addEventListener("click", async (e) => {
        e.preventDefault();
        console.log("🚀 Button wurde geklickt");

        const body = {
            tour_description: document.getElementById("zielort").value,
            tour_date: document.getElementById("datum").value,
            destination: document.getElementById("zielort").value,
            bus_id: document.getElementById("unternehmen").selectedIndex,
            picture_path: null
        };

        console.log("Formulardaten:", body);

        try {
            const res = await fetch('/api/tour/tours', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (res.ok) {
                console.log('Fahrt erfolgreich gespeichert', data);
            } else {
                console.error('Fehler beim Speichern', data);
            }

        } catch (err) {
            console.error("Fehler beim Senden an das Backend:", err);
        }
    });
});

