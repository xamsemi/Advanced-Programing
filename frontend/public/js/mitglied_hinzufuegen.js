import * as navbar from './loadNavbar.js';
import { checkLogin, setupLogout } from './checkLogin.js';

window.addEventListener("DOMContentLoaded", async () => {

    await navbar.loadNavbar();
    const user = await checkLogin(false, true);
    navbar.zeigeAdminBereich(user);

    if (user) setupLogout();

    const form = document.getElementById("mitglied_hinzufuegen_form");
    if (!form) {
        console.error("Formular nicht gefunden");
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); //  WICHTIG

        const name = document.getElementById("vorname").value;
        const address = document.getElementById("adresse").value;
        const email = document.getElementById("email").value;
        const mitgliedSeit = document.getElementById("mitgliedSeit").value;

        if (!name || !address || !email || !mitgliedSeit) {
            alert("Bitte alle Felder ausfüllen.");
            return;
        }

        const newUser = {
            username: name,
            address: address,
            email: email,
            user_role: "user",
            password_hash: "defaultpassword",
            created_at: mitgliedSeit
        };

        console.log("📤 Sende User:", newUser); // DEBUG

        try {
            const response = await fetch("/api/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(newUser)
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text);
            }

            window.location.href = "mitgliederverwaltung.html";

        } catch (err) {
            console.error(" Fehler beim Speichern:", err);
            alert("Fehler beim Speichern des Mitglieds");
        }
    });
});