import * as navbar from './loadNavbar.js';
import { checkLogin, setupLogout } from './checkLogin.js';

window.addEventListener("DOMContentLoaded", async () => {

    // Navbar laden
    await navbar.loadNavbar();

    const user = await checkLogin(false, true);
    navbar.zeigeAdminBereich(user);

    if (user) setupLogout();

    // Formular holen
    const form = document.getElementById("busunternehmen_hinzufuegen_form");
    if (!form) {
        console.error("Formular 'busunternehmen_hinzufuegen_form' nicht gefunden!");
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Verhindert Seitenreload

        // Werte aus Formularfeldern
        const name = document.getElementById("name").value.trim();
        const address = document.getElementById("anschrift").value.trim();
        const contact = document.getElementById("kontakt").value.trim();

        // Validierung
        if (!name || !address || !contact) {
            alert("Bitte alle Felder ausfüllen.");
            return;
        }

        // Objekt für API
        const newCompany = {
            company_name: name,
            contact_info: address,
            company_email: contact
        };

        console.log("Sende Busunternehmen:", newCompany);

        try {
            const response = await fetch("/api/buscompanies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(newCompany)
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Fehler beim Speichern: ${text}`);
            }

            // Erfolgreich → Formular zurücksetzen & weiterleiten
            form.reset();
            window.location.href = "busunternehmen.html";

        } catch (err) {
            console.error("Fehler beim Speichern des Busunternehmens:", err);
            alert("Fehler beim Speichern des Busunternehmens.");
        }
    });
});