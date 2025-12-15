import * as navbar from './loadNavbar.js';
import { setupLogout,checkLogin } from './checkLogin.js';

window.addEventListener('DOMContentLoaded', async () => {

    await navbar.loadNavbar();
    const user = await checkLogin(false, true);
    navbar.zeigeAdminBereich(user);
    

    // Nur laden, wenn Benutzer eingeloggt ist
    if (user) {
        setupLogout();
        ladeTouren();

    }
});

// --- Fahrten dynamisch laden ---
async function ladeTouren() {
  try {
    const res = await fetch('/api/tour/', { credentials: 'include' });
    if (!res.ok) throw new Error('Fehler beim Laden der Touren.');

    const data = await res.json();
    const tours = data.data || []; // wegen { message, data }

    const container = document.getElementById('fahrten-container');

    let classes = "card h-100 text-center shadowed-box";

    tours.forEach(tour => {

      let formattedDate = "—";
      if (tour.tour_date) {
        const tourDate = new Date(tour.tour_date);
        if (!isNaN(tourDate.getTime())) {
          formattedDate = tourDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } else {
          formattedDate = "Ungültiges Datum";
        }
      }

      const col = document.createElement('div');
      col.className = 'col';
      col.innerHTML = `
        <div class="card h-100 text-center">
          <div class="card-body px-3">
            <h4 class="card-title">${tour.destination}</h4>
            <div class="card-subtitle mb">${formattedDate}</div>
            <p class="card-text">${tour.tour_description}</p>
            <a href="infos.html?id=${tour.tour_id}" class="btn btn-outline-primary">Mehr Infos</a>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
} catch (err) {
  console.error(err);
    document.getElementById('fahrten-container').innerHTML =
    `<p class="text-danger">Fehler beim Laden der Touren.</p>`;
  }
}

