import * as navbar from './loadNavbar.js';
import { setupLogout, checkLogin } from './checkLogin.js';

window.addEventListener('DOMContentLoaded', async () => {
    await navbar.loadNavbar();

    // username aus checkLogin
    const loginData = await checkLogin(false, true);
    navbar.zeigeAdminBereich(loginData);

    if (!loginData) return;
    setupLogout();

    try {
        // Alle Benutzer laden
        const response = await fetch("/api/user", { credentials: "include" });
        if (!response.ok) throw new Error(`Fehler beim Laden: ${response.status}`);
        const json = await response.json();
        const users = json.data
       // Nach eingeloggtem Benutzernamen suchen
        const currentUser = users.find(u => u.username === loginData.username);
        if (!currentUser) throw new Error("Eingeloggter Benutzer nicht gefunden");

        console.log("User-ID des eingeloggten Users:", currentUser.user_id);

        // Jetzt die Fahrten laden
        loadMeineFahrten(currentUser);
    } catch (err) {
        console.error('Fehler beim Laden des Benutzers:', err);
    }
});

async function loadMeineFahrten(user) {
    if (!user || !user.user_id) return;

    const response = await fetch(`/api/user_tour/${user.user_id}`, { credentials: "include" });
    const json = await response.json();
    const fahrten = json.data.tours.flat();

    const tbody = document.getElementById("meine-fahrten-table-body");
    tbody.innerHTML = "";

    if (!fahrten || fahrten.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-secondary">Keine Fahrten gefunden.</td></tr>`;
        return;
    }

    for (const tour of fahrten) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${tour.tour_description}</td>
            <td>${tour.tour_date.split('T')[0]}</td>
            <td>${tour.destination}</td>
        `;
        tbody.appendChild(row);
    }
}