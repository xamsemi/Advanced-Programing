//Mitglieder ändern
// lade Daten der Auflistung der Mitglieder  Änderungs-Formular

async function loadUserParameters(user_id) {
    const name = document.getElementById("name");
    const anschrift = document.getElementById("anschrift");
    const email = document.getElementById("email");
    const mitgliedSeit = document.getElementById("mitgliedSeit");

    if (!user_id) {
    console.warn(" Keine User-ID angegeben - lade keine Daten.");
    return;
    }

  try {
        const response = await fetch(`/api/user/${user_id}`, { credentials: "include" });
        if (!response.ok) throw new Error(`Fehler beim Laden des Mitglieds: ${response.status}`);

        const json  = await response.json();
        const user = json.data;
        
        //  Standard-Eintrag setzen
       // user.value = user.name ?? ""; //änderung ??""
      /*      
        const resCompany = await fetch(`/api/user/${user.company_id}`, { credentials: "include" });
        if (!resCompany.ok) throw new Error("Unternehmen konnte nicht geladen werden");
        const company = (await resCompany.json()).data;
*/
        vorname.value = user.username ?? "";
        adresse.value = user.address ?? "";
        email.value = user.email ?? "";
        mitgliedSeit.value = user.created_at.substring(0, 10) ?? "";

        console.log(" Formulardaten geladen", { user });
            
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
            console.error("Fehler beim Laden des Users:", error);
            //user.value = "";
        }
    
    }



// User-ID aus der URL holen, z. B. mitglied_bearbeiten.html?id=3
function getUserIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  console.log("Lade ID:", params.get("id"));
  return params.get("id");
}






const user_id = getUserIdFromURL();

if (user_id) {
    console.log("Lade User mit ID:", user_id);
    loadUserParameters(user_id);
    //loadUserCompanies(); // aus usercompanies_select.js, falls du sie auch brauchst
} else {
    console.warn("Keine User-ID in der URL gefunden!");
}






//*********************** Mitglied bearbeiten (submit) ****************** */

const form = document.querySelector("form");

    form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Verhindert Seitenreload
        const name_var = document.getElementById("vorname").value;
        const adresse_var = document.getElementById("adresse").value;
        const email_var = document.getElementById("email").value;
        const mitgliedSeit_var = document.getElementById("mitgliedSeit").value;
     
        // Objekt für API
        const newUser= {
            username: name_var,
            address: adresse_var,
            email: email_var,
            created_at: mitgliedSeit_var,
            user_role: "user" 
        };
        try {
            console.log("User ID geladen für Update:", user_id);
            const response = await fetch(`/api/user/${user_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(newUser)
            }); 
            if (!response.ok) {
                const errorText = await response.text(); // Inhalt der Antwort lesen
                console.error("Antwort vom Server:", errorText);
                throw new Error(`API Fehler beim Speichern des Users: ${response.status}`);
            }

        } catch (error) {
            console.error("Fehler beim Aktualisieren des Users:", error);
        }
   /*     try {
            // User aus user_id laden, um company_id zu bekommen
            const response_user = await fetch(`/api/users/${user_id}`, { credentials: "include" });
            if (!response_user.ok) throw new Error(`Fehler beim Laden des Users: ${response_user.status}`);

            const json  = await response_bus.json();
            const bus = json.data;

            // company mit company_id updaten


            const response = await fetch(`/api/buscompanies/${bus.company_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(newCompany)
            });
            if (!response.ok) {
                throw new Error(`API Fehler beim Speichern des Unternehmens: ${response.status}`);
        }
         } 
         catch (error) {
            console.error("Fehler beim  Speichern des Mitglieds:", error);
        }
            */
    
    });

    