import * as navbar from './loadNavbar.js';
import { setupLogout,checkLogin } from './checkLogin.js';

window.addEventListener('DOMContentLoaded', async () => {

    await navbar.loadNavbar();
    const user = await checkLogin(false, true);
    navbar.zeigeAdminBereich(user);    

    // Nur laden, wenn Benutzer eingeloggt ist
    if (user) {
        setupLogout();
    }
});

//Mitglieder ändern
// lade Daten der Auflistung der Mitglieder  Änderungs-Formular
async function loadUserParameters(user_id) {    
    const username = document.getElementById("username");
    const address = document.getElementById("address");
    const email = document.getElementById("email");
    const mitgliedSeit = document.getElementById("mitgliedSeit");
    const userrole = document.getElementById("userrole");

    if (!user_id) {
        console.warn(" Keine User-ID angegeben - lade keine Daten.");
        return;
    }

    try {
        const response = await fetch(`/api/user/${user_id}`, { credentials: "include" });
        if (!response.ok) throw new Error(`Fehler beim Laden des Mitglieds: ${response.status}`);

        const json  = await response.json();
        const user = json.data;

        username.value = user.username ?? "";
        address.value = user.address ?? "";
        email.value = user.email ?? "";
        mitgliedSeit.value = user.created_at.substring(0, 10) ?? "";
        userrole.value = user.user_role ?? "";

        console.log(" Formulardaten geladen", { user });

    } catch (error) {
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
    const name_var = document.getElementById("username").value;
    const adresse_var = document.getElementById("address").value;
    const email_var = document.getElementById("email").value;
    const mitgliedSeit_var = document.getElementById("mitgliedSeit").value;
    
    // Objekt für API
    //wenn admin, dann soll user_role admin sein    
    // Nutzerrolle laden für nutzer mit der ID: user_id    

    const response = await fetch(`/api/user/${user_id}`, { credentials: "include" });
    console.log("Response beim Laden des Mitglieds:", response.status);

    if (!response.ok) {
        throw new Error(`Fehler beim Laden: ${response.status}`);
    }

    const json = await response.json();
    const user_temp = json.data;
    
    //console.log("User Rolle ist:", user_temp.user_role);

    const newUser= {
        username: name_var,
        address: adresse_var,
        email: email_var,
        created_at: mitgliedSeit_var,
        user_role: user_temp.user_role  
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

        window.location.href = "mitgliederverwaltung.html"; // Zurück zur Mitgliederübersicht

    } catch (error) {
        console.error("Fehler beim Aktualisieren des Users:", error);
    }    
});

    