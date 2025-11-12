
import { loadNavbar } from './loadNavbar.js';
import { setupLogout,checkLogin } from './checkLogin.js';

loadNavbar();

window.addEventListener('DOMContentLoaded', async () => {
    // Prüfe Login-Status – leite weiter falls ausgeloggt
    const user = await checkLogin(false, true);

    // Nur laden, wenn Benutzer eingeloggt ist
    if (user) {
        setupLogout();
        ladeTouren();
        if(user.role === 'admin') {
          zeigeAdminBereich();
        }
    }
});
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

function zeigeAdminBereich() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // Admin-Bar Container
    const adminBar = document.createElement('button');
    adminBar.textContent = 'Fahrten bearbeiten';
    adminBar.classList.add('btn', 'btn-success', 'btn-sm'); 
    adminBar.style.margin = '5px 0'; 
    adminBar.style.transition = 'background-color 0.3s ease';

    // Hover-Farbe anpassen
    adminBar.addEventListener('mouseover', () => {
        adminBar.style.backgroundColor = '#218838'; // dunkleres grün
    });
    adminBar.addEventListener('mouseout', () => {
        adminBar.style.backgroundColor = '#28a745';
    });

    // Klick auf Admin-Seite
    adminBar.addEventListener('click', () => {
        window.location.href = 'admin_fahrten.html';
    });

    // Wrapper unter der Navbar für Rechtsbündigkeit
    const adminWrapper = document.createElement('div');
    adminWrapper.className = 'container';
    adminWrapper.style.display = 'flex';
    adminWrapper.style.justifyContent = 'flex-end'; // Rechtsbündig
    adminWrapper.style.padding = '0 20px'; // gleiche Abstände wie Navbar
    adminWrapper.appendChild(adminBar);

    // Unterhalb der Navbar einfügen
    navbar.insertAdjacentElement('afterend', adminWrapper);
}