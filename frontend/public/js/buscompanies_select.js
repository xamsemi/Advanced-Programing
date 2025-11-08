// buscompanies_select.js

async function loadBusCompanies() {
    const select = document.getElementById("busunternehmen");

  try {
    const response = await fetch("/api/buscompanies", { credentials: "include" });
    if (!response.ok) throw new Error(`Fehler beim Laden: ${response.status}`);

    const json  = await response.json();
    const companies = json.data;

    // Dropdown leeren und Standard-Eintrag setzen
    select.innerHTML = '<option value="">Bitte auswählen</option>';

    // Optionen erstellen
    companies.forEach(company => {
      const option = document.createElement("option");
      option.value = company.company_id;        // Wert = ID
      option.textContent = company.company_name; // sichtbarer Text
      select.appendChild(option);
    });
  if (!Array.isArray(companies) || companies.length === 0) {
    console.warn("Keine Busunternehmen gefunden!");
  }
  } catch (error) {
    console.error("Fehler beim Laden der Busunternehmen:", error);
    select.innerHTML = '<option value="">Fehler beim Laden</option>';
  }
}

//xxxxxxxxxx



const form = document.querySelector("form");

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // Verhindert Seitenreload

  // Werte aus Formularfeldern holen
  const seats = parseInt(document.getElementById("sitzplaetze").value, 10);
  const companyId = parseInt(document.getElementById("busunternehmen").value, 10);

  // Validierung
  if (isNaN(seats) || seats < 0) {
    alert("Bitte eine gültige Anzahl Sitzplätze eingeben.");
    return;
  }
  if (isNaN(companyId)) {
    alert("Bitte ein Busunternehmen auswählen.");
    return;
  }

  // Objekt für API
  const newBus = {
    bus_seats: seats,
    company_id: companyId
  };

  try {
    const response = await fetch("/api/buses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(newBus)
    });

    if (!response.ok) {
      throw new Error(`Fehler beim Speichern: ${response.status}`);
    }

    const result = await response.json();
    alert("Bus erfolgreich gespeichert!");
    form.reset(); // Formular zurücksetzen

  } catch (error) {
    console.error("Fehler beim Speichern des Busses:", error);
    alert("Fehler beim Speichern des Busses.");
  }
});



// Direkt beim Laden der Seite ausführen
//document.addEventListener("DOMContentLoaded", loadBusCompanies);
loadBusCompanies();