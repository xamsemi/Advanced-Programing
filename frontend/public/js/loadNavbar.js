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

export async function zeigeAdminBereich(user) {
    if (!user || user.user_role !== 'admin') {
        return; // Kein Admin → nichts anzeigen
    }


    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    
    const innerContainer = navbar.querySelector('.container');
    if (!innerContainer) return;

    // --- Neuer Wrapper: gleiche Klasse wie innerContainer, damit Breite/Ausrichtung übereinstimmen ---
    const wrapper = document.createElement('div');
    wrapper.className = innerContainer.className;

    // Stil: Buttons rechtsbündig innerhalb dieses Wrappers
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'flex-end';
    wrapper.style.gap = '10px';
    wrapper.style.marginTop = '6px';
    wrapper.style.marginBottom = '10px';
    

    // Button-Factory
    const makeButton = (text, classes, hoverColor, target) => {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.classList.add('btn', ...classes, 'btn-sm');
        btn.style.whiteSpace = 'nowrap';
        btn.style.width = 'auto';
        btn.style.transition = 'background-color 0.18s ease';

        btn.addEventListener('mouseover', () => btn.style.backgroundColor = hoverColor);
        btn.addEventListener('mouseout', () => btn.style.backgroundColor = '');
        btn.addEventListener('click', () => window.location.href = target);

        return btn;
    };

    const adminBar = makeButton('Fahrten bearbeiten', ['btn-primary'], '#0056b3', 'admin_fahrten.html');
    const userBtn   = makeButton('Benutzer verwalten',   ['btn-primary'], '#0056b3', 'mitgliederverwaltung.html');
    const companiesBtn   = makeButton('Busunternehmen verwalten',   ['btn-primary'], '#0056b3', 'busunternehmen.html');

    wrapper.appendChild(adminBar);
    wrapper.appendChild(userBtn);
    wrapper.appendChild(companiesBtn);

    // WICHTIG: wrapper NACH dem <nav> einfügen (also außerhalb der Navbar)
    navbar.insertAdjacentElement('afterend', wrapper);
}