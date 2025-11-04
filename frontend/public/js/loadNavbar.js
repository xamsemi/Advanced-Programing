// Datei: js/loadNavbar.js
export async function loadNavbar() {
    try {
        const response = await fetch('partials/navbar.html');
        if (!response.ok) throw new Error(`HTTP-Fehler: ${response.status}`);

        const html = await response.text();
        document.getElementById('navbar-placeholder').innerHTML = html;

    } catch (err) {
        console.error("Fehler beim Laden der Navbar:", err);
    }
}