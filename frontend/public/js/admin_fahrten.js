import * as navbar from './loadNavbar.js';
import { setupLogout,checkLogin } from './checkLogin.js';

window.addEventListener('DOMContentLoaded', async () => {
  

  await navbar.loadNavbar();
  const user = await checkLogin(false, true);
  navbar.zeigeAdminBereich(user);


const res = await fetch('/api/tour/', { credentials: 'include' });
const data = await res.json();
console.log("Touren aus Backend:", data);

  // Nur laden, wenn Benutzer eingeloggt ist
  if (user) {
    setupLogout();
    ladeAdminButtons();
    ladeTourenAdmin();
  }
});

function loadMailerForm() {
  const mailerModal = new bootstrap.Modal(document.getElementById('mailerModal'));
  mailerModal.show();
}

export function ladeAdminButtons() {
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
    const res = await fetch('/api/tour/', { credentials: 'include' });
    const data = await res.json();
    const tours = data.data || [];
    
    const resBuse = await fetch('/api/buses/', { credentials: 'include' });
    const dataBuse = await resBuse.json();
    const allBuses = dataBuse.data || [];

    const table = document.getElementById('fahrten-tabelle');
    if (!table) {
      console.error('fahrten-tabelle existiert nicht!');
      return;
    }

    table.innerHTML = '';
    table.className = 'table table-dark table-hover align-middle mb-0 rounded';

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr class="text-primary">
        <th scope="col">Zielort</th>
        <th scope="col">Datum</th>
        <th scope="col">Abfahrtszeit</th>
        <th scope="col">Teilnehmer</th>
        
        <th scope="col">Busunternehmen</th>
        <th scope="col" class="text-center">Aktionen</th>
      </tr>
    `;

    const tbody = document.createElement('tbody');

    for (let tour of tours) {
      const [datumTeil, zeitTeil] = tour.tour_date.split("T"); // ["2026-02-15", "10:00:00.000Z"]
      const datum = datumTeil;
      const abfahrtszeit = zeitTeil.slice(0, 5); // "10:00"
      

      // Teilnehmer / freie Plätze
      const teilnehmer = tour.participants || 0;
      const freiePlaetze = tour.max_participants ? (tour.max_participants - teilnehmer) : 'Dummy';

      // Busunternehmen anhand von bus_id finden
      const bus = allBuses.find(b => b.bus_id === tour.bus.bus_id);
      const companyName = bus.company.company_name;
      // Zeile erstellen
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${tour.destination}</td>
        <td>${datum}</td>
        <td>${abfahrtszeit}</td>
        <td>${teilnehmer}</td>
        <td>${companyName}</td>
        <td class="text-center">
          <a href="fahrt_bearbeiten.html?tour_id=${tour.tour_id}" class="btn btn-sm btn-outline-warning mx-2">Bearbeiten</a>
          <button class="btn btn-sm btn-outline-danger btn-delete mx-2">Löschen</button>
          <button class="btn btn-sm btn-outline-info btn-mail mx-2">Mail</button>
        </td>
      `;
      tbody.appendChild(tr);

      // === Event Listener für Löschen ===
      tr.querySelector('.btn-delete').addEventListener('click', async () => {
        try {
          const res = await fetch(`/api/tour/${tour.tour_id}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          if (!res.ok) throw new Error('Fehler beim Löschen der Fahrt');
          // Tabelle neu laden
          await ladeTourenAdmin();
        } catch (err) {
          console.error(err);
          alert('Fehler beim Löschen der Fahrt.');
        }
      });
      // Mail-Button
      tr.querySelector('.btn-mail').addEventListener('click', () => {
        try {
          loadMailerForm();
          document.getElementById('mailerModalLabel').textContent = `Email an Busunternehmen für Fahrt ID: ${tour.tour_id}`;
          document.getElementById('emailSubject').value = `Anfrage zur Vereinsausfahrt am ${datum}`;
          document.getElementById('emailBody').value =
            `Sehr geehrte Damen und Herren,\nich möchte Sie über die folgende Fahrt informieren:\n` +
            `Zielort: ${tour.destination}\nDatum: ${datum}\nAbfahrtszeit: ${abfahrtszeit}\n` +
            `Freie Plätze: ${freiePlaetze}\nMit freundlichen Grüßen,\n[Ihr Name]`;

          const sendBtn = document.getElementById('sendMailBtn');

          // Listener vorher entfernen, sonst gibt es mehrfaches Senden
          sendBtn.replaceWith(sendBtn.cloneNode(true));
          const newSendBtn = document.getElementById('sendMailBtn');

          newSendBtn.addEventListener('click', async () => {
            const mailData = {
              tourId: tour.tour_id,
              emailSubject: document.getElementById('emailSubject').value,
              emailBody: document.getElementById('emailBody').value
            };

            const res = await fetch('/api/mailer/tour', {
              method: 'POST',
              body: JSON.stringify(mailData),
              headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) throw new Error('Fehler beim Senden der Email.');
            console.log('Email erfolgreich an Busunternehmen gesendet.');
            bootstrap.Modal.getInstance(document.getElementById('mailerModal')).hide();
            alert('Email erfolgreich an Busunternehmen gesendet.');
          });
        } catch (err) {
          console.error(err.message);
        }
});



    }

    table.appendChild(thead);
    table.appendChild(tbody);

  } catch (err) {
    console.error(err);
  }
}