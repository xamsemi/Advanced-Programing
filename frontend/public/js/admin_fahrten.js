import { loadNavbar } from './loadNavbar.js';
import { setupLogout,checkLogin } from './checkLogin.js';
loadNavbar();

window.addEventListener('DOMContentLoaded', async () => {
    // Prüfe Login-Status – leite weiter falls ausgeloggt
    const user = await checkLogin(false, true);

    // Nur laden, wenn Benutzer eingeloggt ist
    if (user) {
        setupLogout();
        ladeAdminButtons();
        ladeTourenAdmin();
    }
});

function ladeAdminButtons() {
    const mainContainer = document.querySelector('main.container');

    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'text-center mb-5';

    // + Neue Fahrt hinzufügen
    const addButton = document.createElement('a');
    addButton.href = 'fahrt_hinzufuegen.html';
    addButton.className = 'btn btn-primary mt-3 px-4 me-2';
    addButton.textContent = '+ Neue Fahrt hinzufügen';

    // Nachricht an alle Teilnehmer senden
    const msgButton = document.createElement('button');
    msgButton.className = 'btn btn-primary mt-3 px-4';
    msgButton.textContent = 'Nachricht an alle Teilnehmer senden';
    msgButton.addEventListener('click', () => {
        alert('Nachricht an alle Teilnehmer gesendet!');
    });

    buttonWrapper.appendChild(addButton);
    buttonWrapper.appendChild(msgButton);

    // Ganz oben im Main-Container einfügen
    mainContainer.prepend(buttonWrapper);
}

async function ladeTourenAdmin() {
  try {
    const res = await fetch('/api/tour/tours', { credentials: 'include' });
    if (!res.ok) throw new Error('Fehler beim Laden der Touren.');

    const data = await res.json();
    const tours = data.data || [];

    // Container: Tabelle
    const table = document.getElementById('fahrten-tabelle');
    if (!table) {
      console.error('fahrten-tabelle existiert nicht!');
      return;
    }

    // Tabelle leeren
    table.innerHTML = '';

    // Bootstrap-Klassen wie im statischen HTML
    table.className = 'table table-dark table-hover align-middle mb-0 rounded';

    // Kopfzeile erstellen
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr class="text-primary">
        <th scope="col">Zielort</th>
        <th scope="col">Datum</th>
        <th scope="col">Abfahrtszeit</th>
        <th scope="col">Teilnehmer</th>
        <th scope="col">Freie Plätze</th>
        <th scope="col">Busunternehmen</th>
        <th scope="col" class="text-center">Aktionen</th>
      </tr>
    `;

    // Body erstellen
    const tbody = document.createElement('tbody');

    tours.forEach(tour => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${tour.destination}</td>
        <td>${new Date(tour.tour_date).toLocaleDateString('de-DE')}</td>
        <td>${tour.departure_time || '-'}</td>
        <td>${tour.participants || 0}</td>
        <td>${(tour.max_participants || 0) - (tour.participants || 0)}</td>
        <td>${tour.bus_company || '-'}</td>
        <td class="text-center">
          <a href="fahrt_bearbeiten.html?id=${tour.tour_id}" class="btn btn-sm btn-outline-warning me-2">Bearbeiten</a>
          <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${tour.tour_id}">Löschen</button>
        </td>
      `;
      tbody.appendChild(tr);

      // Löschen-Button Event
      tr.querySelector('.btn-delete').addEventListener('click', async () => {

        try {
          const res = await fetch(`/api/tour/${tour.tour_id}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          if (!res.ok) throw new Error('admin_fahrten.js: Fehler beim Löschen der Fahrt');

          // Tabelle nach erfolgreichem Löschen neu laden
          await ladeTourenAdmin();
        } catch (err) {
          console.error(err);
          alert('Fehler beim Löschen der Fahrt.');
        }
      });
    });

    // An die Tabelle anhängen
    table.appendChild(thead);
    table.appendChild(tbody);

  } catch (err) {
    console.error(err);
    const container = document.getElementById('fahrten-tabelle');
    if (container) {
      container.innerHTML = `<p class="text-danger">Fehler beim Laden der Touren.</p>`;
    }
  }
}