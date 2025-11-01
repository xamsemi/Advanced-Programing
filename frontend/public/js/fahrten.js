
import { setupLogout,checkLogin } from './checkLogin.js';

checkLogin(false, true);
setupLogout();
ladeTouren();

// --- Seitenzugriff nur mit gültiger Session erlauben ---
(async () => {
    try {
        const res = await fetch('/api/user/profile', { credentials: 'include' });
        if (!res.ok) {
            // Kein gültiges Session-Cookie → zur Login-Seite zurück
            window.location.href = 'index.html';
        } else {
            ladeTouren();
        }
        } catch (err) {
          console.error('Fehler bei der Sitzungsprüfung:', err);
          window.location.href = 'index.html';
        }
      })();

// --- Fahrten dynamisch laden ---
    async function ladeTouren() {
        try {
          const res = await fetch('/api/tour/tours', { credentials: 'include' });
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
                  – ${tour.tour_description}
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