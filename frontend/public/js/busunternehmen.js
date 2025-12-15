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
    console.log("Response beim Laden der Busse:", response.status);
    if (!response.ok) {
      throw new Error(`Fehler beim Laden: ${response.status}`);
    }

    const json = await response.json();
    const buses = json.data;

    const tbody = document.getElementById("bus-table-body");
    tbody.innerHTML = "";

    if (!buses || buses.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-secondary">Keine Busse gefunden.</td></tr>`;
      return;
    }
    for (const bus of buses) {
      
      //## Kommt bereits mit Bus Objekt mit
      /*
      const response = await fetch(`/api/buscompanies/${bus.company_id}`, { credentials: "include" });
      console.log("Response beim Laden der Busunternehmen:", response.status);
      
      if (!response.ok) {
        throw new Error(`Fehler beim Laden: ${response.status}`);
      }

      const json_bu = await response.json();
      */

      const company = bus.company;

      const row = document.createElement("tr");

      row.innerHTML = `
        
        <td>${company.company_name}</td>
        <td>${bus.bus_seats}</td>
        <td>${company.contact_info}</td>
        <td>${company.company_email}</td>
        <td class="text-center">
          <a href="busunternehmen_bearbeiten.html?id=${bus.bus_id}" class="btn btn-sm btn-outline-warning me-2">Bearbeiten</a>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteBus(${bus.bus_id})">Löschen</button>
        </td>
      `;
      tbody.appendChild(row);
    };
  } catch (error) {
    console.error("Fehler beim Laden der Busse:", error);
    console.log("Response:", response?.status);
    const tbody = document.getElementById("bus-table-body");
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Fehler beim Laden der Daten von busunternehmen.js</td></tr>`;
  }
}

async function deleteBus(id) {
  if (!confirm("Diesen Bus wirklich löschen?")) return;

  try {
    const res = await fetch(`/api/buses/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Bus gelöscht!");
      loadBuses();
    } else {
      alert("Fehler beim Löschen.");
    }
  } catch (err) {
    console.error("Fehler beim Löschen:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadBuses);
