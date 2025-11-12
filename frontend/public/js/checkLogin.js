// --- Login Status prüfen ---
export async function checkLogin(redirectIfLoggedIn = false, redirectIfLoggedOut = false) {
    let userData = null;
    
    try{
        const res = await fetch('/api/user/profile', { credentials: 'include' });
        if (res.ok) userData = await res.json();
    } catch (err){
        console.error("Fehler bei Profilabfrage:",err);
    }

    const userInfo = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');

    if (userData) {
        if(userInfo) userInfo.textContent = `Eingeloggt als: ${userData.username} (${userData.role})`;
        if(logoutBtn) logoutBtn.style.display = 'inline-block';
        if(redirectIfLoggedIn && (window.location.pathname === '/' || window.location.pathname.includes('index.html'))){
            window.location.href = 'fahrten.html';
        }        
    } else {
        if (userInfo) userInfo.textContent = 'Kein Benutzer eingeloggt';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (redirectIfLoggedOut && !window.location.pathname.endsWith('index.html')) {
            // Wenn nicht eingeloggt und nicht auf Login-Seite -> weiterleiten
            window.location.href = 'index.html';
        }
    }
    return userData;
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

