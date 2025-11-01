// --- Login Status prüfen ---
export async function checkLogin(redirectIfLoggedIn = false, redirectIfLoggedOut = false) {
    const res = await fetch('/api/user/profile', { credentials: 'include' });
    const userInfo = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');

    if (res.ok) {
        const data = await res.json();
        userInfo.textContent = `Eingeloggt als: ${data.username}`;
        logoutBtn.style.display = 'inline-block';
         if (redirectIfLoggedIn && window.location.pathname.includes('index.html')) {
            // Wenn eingeloggt und auf Login-Seite -> weiterleiten
            window.location.href = 'fahrten.html';
         }
        
    } else {
        if (userInfo) userInfo.textContent = 'Kein Benutzer eingeloggt';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (redirectIfLoggedOut && !window.location.pathname.includes('index.html')) {
            // Wenn nicht eingeloggt und nicht auf Login-Seite -> weiterleiten
            window.location.href = 'index.html';
        }
        

    }
}

// --- Logout Setup ---
export function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', async () => {
        try {
            const res = await fetch('/api/user/logout', {
                method: 'POST',
                credentials: 'include'
            });
            await res.json();
            checkLogin(false, true); // Status nach Logout prüfen
        } catch (err) {
            console.error('Logout-Fehler:', err);
            alert('Logout fehlgeschlagen');
        }
    });
}

