


document.addEventListener("DOMContentLoaded", () => {

  const formAddUser = document.getElementById("mitglied_hinzufuegen_form");
  setupUserAddForm(formAddUser);
  

});









function setupUserAddForm(form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    //const form_busunternehmen = document.querySelector("form");

    //form_busunternehmen.addEventListener("submit", async (event) => {
    // event.preventDefault(); // Verhindert Seitenreload

    // Werte aus Formularfeldern holen
    const name = document.getElementById("vorname").value;
    const address = document.getElementById("adresse").value;
    const contact = document.getElementById("email").value;
    const mitgliedSeit = document.getElementById("mitgliedSeit").value;


    // Validierung
    if (!name || !address || !contact || !mitgliedSeit) {
        alert("Bitte alle Felder ausfüllen.");
        return;
    }

    // Objekt für API
    const newUser = {
        username: name,
        address: address,
        email: contact,
        user_role: "user",
        password_hash: "defaultpassword", // Standardpasswort, sollte später geändert werden
        created_at: mitgliedSeit
    };

    try {
        const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newUser)
        });

        if (!response.ok) {
        throw new Error(`Fehler beim Speichern: ${response.status}`);
        }

        const result = await response.json();
        alert("Mitglied erfolgreich gespeichert!");
        form.reset(); // Formular zurücksetzen

    } catch (error) {
        console.error("Fehler beim Speichern des Mitglieds:", error);
        alert("Fehler beim Speichern des Mitglieds.");
    }
    });
    
}