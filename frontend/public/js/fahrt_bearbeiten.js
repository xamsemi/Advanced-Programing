import * as navbar from './loadNavbar.js';
import { setupLogout,checkLogin } from './checkLogin.js';



window.addEventListener('DOMContentLoaded', async () => {
    await navbar.loadNavbar();
    navbar.zeigeAdminBereich();
    // Prüfe Login-Status – leite weiter falls ausgeloggt
    const user = await checkLogin(false, true);

    // Nur laden, wenn Benutzer eingeloggt ist
    if (user) {
        setupLogout();
        ladeTour();
    }
});
// --- Fahrten dynamisch laden --- ACHTUNG muss noch angepasst werden
async function ladeToure() {
  try {
    const res = await fetch('/api/tour/', { credentials: 'include' });
    if (!res.ok) throw new Error('Fehler beim Laden der Touren.');

    const data = await res.json();
    const tours = data.data || []; // wegen { message, data }

    const container = document.getElementById('fahrten-container');
    container.innerHTML = ''; // alte Karten löschen

    tours.forEach(tour => {
      const col = document.createElement('div');
      col.className = 'col';
      col.innerHTML = `
        <div class="card h-100 text-center shadow-sm">
          <div class="card-body">
            <h4 class="card-title">${tour.destination}</h4>
            <p class="card-text">
              ${new Date(tour.tour_date).toLocaleDateString('de-DE')}
              ${tour.tour_description}
            </p>
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

