
// Busunternehmen ändern
// lade Daten der Auflistung der Busse und Unternehmen in Änderungs-Formular

async function loadBusParameters(bus_id) {
    const name = document.getElementById("name");
    const seats = document.getElementById("sitzplaetze");
    const anschrift = document.getElementById("anschrift");
    const kontakt = document.getElementById("kontakt");

    if (!bus_id) {
    console.warn(" Keine Bus-ID angegeben - lade keine Daten.");
    return;
    }

  try {
        const response = await fetch(`/api/buses/${bus_id}`, { credentials: "include" });
        if (!response.ok) throw new Error(`Fehler beim Laden des Busses: ${response.status}`);

        const json  = await response.json();
        const bus = json.data;
        
        //  Standard-Eintrag setzen
        seats.value = bus.bus_seats ?? ""; //änderung ??""

        /*    
        const resCompany = await fetch(`/api/buscompanies/${bus.company_id}`, { credentials: "include" });
        if (!resCompany.ok) throw new Error("Unternehmen konnte nicht geladen werden");
        const company = (await resCompany.json()).data;
        */

        const company = bus.company
        
        name.value = company.company_name ?? "";
        anschrift.value = company.contact_info ?? "";
        kontakt.value = company.company_email ?? "";

        console.log(" Formulardaten geladen", { bus, company });
            
      /*        // Company-Daten laden
            try{
                    const company_id = bus.company_id;
                    const response_company = await fetch(`/api/buscompanies/${company_id}`, { credentials: "include" });
                    if (!response_company.ok) 
                        throw new Error(`Fehler beim Laden des Busunternehmens: ${response_company.status}`);

                    const json_company = await response_company.json();
                    const company = json_company.data;

                    name.value = company.company_name ?? "";
                    anschrift.value = company.contact_info ?? "";
                    kontakt.value = company.company_email ?? "";

                } 
                catch (error) {
                    console.error("Fehler beim Laden des Busunternehmens:", error);
                    name.value = anschrift.value = kontakt.value = "";

                }

*/

        } 
        
        catch (error) {
            console.error("Fehler beim Laden des Bus:", error);
            seats.value = "";
        }
    }




// Bus-ID aus der URL holen, z. B. busunternehmen_bearbeiten.html?id=3
function getBusIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  console.log("Lade ID:", params.get("id"));
  return params.get("id");
}






const bus_id = getBusIdFromURL();

if (bus_id) {
    console.log("Lade Bus mit ID:", bus_id);
    loadBusParameters(bus_id);
    //loadBusCompanies(); // aus buscompanies_select.js, falls du sie auch brauchst
} else {
    console.warn("Keine Bus-ID in der URL gefunden!");
}






//***************************************** */

const form = document.querySelector("form");

    form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Verhindert Seitenreload
        const seats = document.getElementById("sitzplaetze").value;
        const company_name = document.getElementById("name").value;
        const contact_info = document.getElementById("anschrift").value;
        const company_email = document.getElementById("kontakt").value;
     
        // Objekt für API
        const newBus = {
            bus_seats: seats
        }
        const newCompany = {
            company_name: company_name,
            contact_info: contact_info,
            company_email: company_email
        };
        try {
            console.log("Bus ID geladen für Update:", bus_id);
            const response = await fetch(`/api/buses/${bus_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(newBus)
            }); 
            if (!response.ok) {
                const errorText = await response.text(); // Inhalt der Antwort lesen
                console.error("Antwort vom Server:", errorText);
                throw new Error(`API Fehler beim Speichern des Busses: ${response.status}`);
            }

        } catch (error) {
            console.error("Fehler beim Aktualisieren des Busses:", error);
        }
        try {
            // bus aus bus_id laden, um company_id zu bekommen
            const response_bus = await fetch(`/api/buses/${bus_id}`, { credentials: "include" });
            if (!response_bus.ok) throw new Error(`Fehler beim Laden des Busses: ${response_bus.status}`);

            const json  = await response_bus.json();
            const bus = json.data;

            // company mit company_id updaten
            console.log("Bus hat Sitz:", bus.bus_seats);
            console.log("Company ID geladen für Update:", bus.company.company_id);
            const response = await fetch(`/api/buscompanies/${bus.company.company_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(newCompany)
            });
            if (!response.ok) {
                throw new Error(`API Fehler beim Speichern des Unternehmens: ${response.status}`);
            }
        } catch (error) {
            console.error("Fehler beim  Speichern des Unternehmens:", error);
        }
        window.location.href = "busunternehmen.html"; // Zurück zur Busunternehmen-Übersicht
    });