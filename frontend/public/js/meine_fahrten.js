import * as navbar from './loadNavbar.js';
import { setupLogout,checkLogin } from './checkLogin.js';


navbar.loadNavbar();

window.addEventListener('DOMContentLoaded', async () => {
    // Prüfe Login-Status – leite weiter falls ausgeloggt
    const user = await checkLogin(false, true);

    console.log("Eingeloggter User:", user);

    // Nur laden, wenn Benutzer eingeloggt ist
    if (user) {
        setupLogout();
        if(user.role === 'admin') {
          navbar.zeigeAdminBereich();
        }

        // user aus checkLogin hat keine user_id und daher kann diese ID auch nicht zum Vergleich der Daten aus user_tour genutzt werden
        // kann hier dem user noch die user_id hinzugefügt werden?

        /*
        console.log("Username:", user.username);

        const response = await fetch(`/api/user/by-username/${user.username}`, { credentials: "include" });
        if (!response.ok) throw new Error(`Fehler beim Laden des Mitglieds ueber name: ${response.status}`);

        const json  = await response.json();
        const user2 = json.data;
        */

        loadMeineFahrten(user);

    }
});


async function loadMeineFahrten(user) {
  try {
    const fahrten = user.tours.flat();

    const tbody = document.getElementById("meine-fahrten-table-body");
    tbody.innerHTML = "";

    if (!fahrten || fahrten.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-secondary">Keine Fahrten gefunden.</td></tr>`;
      return;
    }
    for (const tour of fahrten) {     
        
      console.log("tourbeschreibung:", tour.tour_description);      

      const row = document.createElement("tr");

      let formattedDate = "—";
      if (tour.tour_date) {
        const tourDate = new Date(tour.tour_date);
        if (!isNaN(tourDate.getTime())) {
          formattedDate = tourDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } else {
          formattedDate = "Ungültiges Datum";
        }
      }

      row.innerHTML = `
        <td>${tour.tour_description}</td>
        <td>${formattedDate}</td>
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

// async function loadMeineFahrten(user2) {
//   try {
//     console.log("Meine User-ID:", user2.user_id); // Prüfe ob user_id vorhanden ist, nur zum Testen
//     //const response = await fetch(`/api/user_tour/${1}`, { credentials: "include" });    // hardcoded 3 zum Testen
//     const response = await fetch(`/api/user_tour/${user2.user_id}`, { credentials: "include" }); // wenn user eine user_id hat, diese Zeile  nutzen

//     console.log("Response beim Laden meiner Fahrten:", response.status);
//     if (!response.ok) {
//       throw new Error(`Fehler beim Laden: ${response.status}`);
//     }

//     const json = await response.json();
//     const fahrten = json.data.tours.flat();

//     const tbody = document.getElementById("meine-fahrten-table-body");
//     tbody.innerHTML = "";

//     if (!fahrten || fahrten.length === 0) {
//       tbody.innerHTML = `<tr><td colspan="5" class="text-center text-secondary">Keine Fahrten gefunden.</td></tr>`;
//       return;
//     }
//     for (const tour of fahrten) {
       
      
        
//       console.log("tourbeschreibung:", tour.tour_description   );
      

//       const row = document.createElement("tr");

//       row.innerHTML = `
//         <td>${tour.tour_description}</td>
//         <td>${tour.tour_date.split('T')[0]}</td>
//         <td>${tour.destination}</td>
//            `;
//       tbody.appendChild(row);
//     };

//   } catch (error) {
//     console.error("Fehler beim Laden meiner Fahrten:", error);
//     console.log("Response:", response?.status);
//     const tbody = document.getElementById("meine-fahrten-table-body");
//     tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Fehler beim Laden der Daten von meine_fahrten.js</td></tr>`;
//   }
// }



//document.addEventListener("DOMContentLoaded", loadMeineFahrten);
