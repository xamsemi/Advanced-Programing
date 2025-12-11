import * as navbar from './loadNavbar.js';
import { setupLogout,checkLogin } from './checkLogin.js';


navbar.loadNavbar();

window.addEventListener('DOMContentLoaded', async () => {
    // Prüfe Login-Status – leite weiter falls ausgeloggt
    const user = await checkLogin(false, true);

    // Nur laden, wenn Benutzer eingeloggt ist
    if (user) {
        setupLogout();
        if(user.role === 'admin') {
          navbar.zeigeAdminBereich();
        }
        // user aus checkLogin hat keine user_id und daher kann diese ID auch nicht zum Vergleich der Daten aus user_tour genutzt werden
        // kann hier dem user noch die user_id hinzugefügt werden?
        loadMeineFahrten(user);

    }
});




async function loadMeineFahrten(user) {
  try {
    console.log("Meine User-ID:", user.user_id); // Prüfe ob user_id vorhanden ist, nur zum Testen
    const response = await fetch(`/api/user_tour/${3}`, { credentials: "include" });    // hardcoded 3 zum Testen
    //const response = await fetch(`/api/user_tour/${user.user_id}`, { credentials: "include" }); // wenn user eine user_id hat, diese Zeile  nutzen

    console.log("Response beim Laden meiner Fahrten:", response.status);
    if (!response.ok) {
      throw new Error(`Fehler beim Laden: ${response.status}`);
    }

    const json = await response.json();
    const fahrten = json.data.tours.flat();

    const tbody = document.getElementById("meine-fahrten-table-body");
    tbody.innerHTML = "";

    if (!fahrten || fahrten.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-secondary">Keine Fahrten gefunden.</td></tr>`;
      return;
    }
    for (const tour of fahrten) {
       
      
        
      console.log("tourbeschreibung:", tour.tour_description   );
      

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${tour.tour_description}</td>
        <td>${tour.tour_date.split('T')[0]}</td>
        <td>${tour.destination}</td>
           `;
      tbody.appendChild(row);
    };

  } catch (error) {
    console.error("Fehler beim Laden meiner Fahrten:", error);
    console.log("Response:", response?.status);
    const tbody = document.getElementById("meine-fahrten-table-body");
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Fehler beim Laden der Daten von meine_fahrten.js</td></tr>`;
  }
}



//document.addEventListener("DOMContentLoaded", loadMeineFahrten);
