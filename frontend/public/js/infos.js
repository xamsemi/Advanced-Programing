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
        document.getElementById("tourTitle").textContent = tour.destination;
        document.getElementById("tourDate").textContent = new Date(tour.tour_date).toLocaleDateString("de-DE");
        document.getElementById("tourDeparture").textContent = tour.departure_time || "Keine Angabe";
        document.getElementById("tourSeats").textContent = `${tour.free_seats} von ${tour.total_seats}`;
        document.getElementById("tourDescription").textContent = tour.tour_description;

        // Bild, falls vorhanden
        document.getElementById("tourImage").src = tour.image_url || "img/placeholder.jpg";

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