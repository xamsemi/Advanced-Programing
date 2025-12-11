import * as navbar from './loadNavbar.js';
import { checkLogin, setupLogout } from './checkLogin.js';

window.addEventListener('DOMContentLoaded', async () => {

    await navbar.loadNavbar();
    const user = await checkLogin(false, true);
    navbar.zeigeAdminBereich(user);

    if (user) setupLogout();

    ladeTourDetails();
});


async function ladeTourDetails() {
    // ID aus URL auslesen
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        alert("Keine Tour-ID übergeben.");
        return;
    }

    try {
        const res = await fetch(`/api/tour/${id}`, { credentials: 'include' });
        if (!res.ok) throw new Error("Tour nicht gefunden.");

        const data = await res.json();
        const tour = data.data[0];
        console.log(tour);

        // -----------------------------
        // Felder dynamisch füllen
        // -----------------------------
        const isoString = tour.tour_date; // z.B. "2026-02-15T00:00:00.000Z"

        // Datum
        const [datePart, timePart] = isoString.split('T'); // ["2026-02-15", "00:00:00.000Z"]
        const [year, month, day] = datePart.split('-');
        document.getElementById("tourTitle").textContent = tour.destination;
        document.getElementById("tourDate").textContent = `${day}.${month}.${year}`;
        const time = timePart.substring(0,5); // "00:00"
        document.getElementById("tourDeparture").textContent = time;
        document.getElementById("tourSeats").textContent = `${tour.bus.bus_seats} Plätze`;
        document.getElementById("tourDescription").textContent = tour.tour_description;
        document.getElementById("tourImage").src = tour.picture_url;

        

        // Reservierungsknopf
        document.getElementById("reserveBtn").addEventListener("click", () => {
            window.location.href = `reservierung.html?id=${tour.tour_id}`;
        });

    } catch (err) {
        console.error(err);
        document.querySelector(".info-card").innerHTML =
            `<p class="text-danger text-center p-3">Fehler beim Laden der Tour.</p>`;
    }
}