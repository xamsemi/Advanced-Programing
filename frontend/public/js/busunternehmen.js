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
 
    loadBuses();
  }
});

async function loadBuses() {
  try {
    const response = await fetch("/api/buses", { credentials: "include" });
    if (!response.ok) throw new Error(`Fehler beim Laden: ${response.status}`);

    const json = await response.json();
    const buses = json.data;

    // Nach Busunternehmen gruppieren
    buses.sort((a, b) =>
      a.company.company_name.localeCompare(b.company.company_name, 'de')
    );

    const tbody = document.getElementById("bus-table-body");
    tbody.innerHTML = "";

    if (!buses || buses.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-secondary">Keine Busse gefunden.</td></tr>`;
      return;
    }

    for (const bus of buses) {
      const company = bus.company;

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${company.company_name}</td>
        <td>${bus.bus_seats}</td>
        <td>${company.contact_info}</td>
        <td>${company.company_email}</td>
        <td class="text-center">
          <a href="busunternehmen_bearbeiten.html?id=${bus.bus_id}" class="btn btn-sm btn-outline-warning me-2">Bearbeiten</a>
        </td>
      `;

      // Löschen-Button erstellen
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Löschen";
      deleteBtn.className = "btn btn-sm btn-outline-danger ms-2";

      // EventListener für Löschen
      deleteBtn.addEventListener("click", () => deleteBus(bus.bus_id));

      // Button in die letzte Zelle anhängen
      row.querySelector("td.text-center").appendChild(deleteBtn);

      tbody.appendChild(row);
    }
  } catch (error) {
    console.error("Fehler beim Laden der Busse:", error);
    const tbody = document.getElementById("bus-table-body");
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Fehler beim Laden der Daten</td></tr>`;
  }
}

async function deleteBus(id) {
  if (!confirm("Diesen Bus wirklich löschen?")) return;

  try {
    const res = await fetch(`/api/buses/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Bus gelöscht!");
      loadBuses(); // Tabelle neu laden
    } else {
      alert("Fehler beim Löschen.");
    }
  } catch (err) {
    console.error("Fehler beim Löschen:", err);
  }
}


document.addEventListener("DOMContentLoaded", loadBuses);
