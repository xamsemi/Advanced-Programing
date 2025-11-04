import { checkLogin, setupLogout } from './checkLogin.js';

window.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.getElementById('loginContainer');
    const status = document.getElementById('responseLogin');
    const toggleRegisterBtn = document.getElementById('toggleRegisterBtn');
    const regContainer = document.getElementById('registerContainer');
    const registerBtn = document.getElementById('registerBtn');
    const regResponse = document.getElementById('regResponse');

    // --- Login-Status prüfen (leitet ggf. weiter zu fahrten.html)
    await checkLogin(true, false);

    // ---Logout-Button aktivieren
    setupLogout();

    // ---Login-Handler
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        status.textContent = '';

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            const res = await fetch('/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok) {
                status.classList.remove('text-danger');
                status.classList.add('text-success');
                status.textContent = 'Login erfolgreich!';
                await checkLogin(true, false); // Navbar aktualisieren & ggf. redirect
            } else {
                status.classList.remove('text-success');
                status.classList.add('text-danger');
                status.textContent = `Fehler: ${data.message || 'Login fehlgeschlagen'}`;
            }
        } catch (err) {
            console.error(err);
            status.textContent = 'Serverfehler beim Login';
        }
    });

    // ---Registrierung anzeigen/verstecken ---
    toggleRegisterBtn.addEventListener('click', () => {
        const isVisible = regContainer.style.display === 'block';
        regContainer.style.display = isVisible ? 'none' : 'block';
        toggleRegisterBtn.textContent = isVisible
            ? 'Noch kein Konto? Jetzt registrieren'
            : 'Zurück zum Login';
    });

    // ---Registrierung absenden ---
    registerBtn.addEventListener('click', async () => {
        const username = document.getElementById('regUsername').value.trim();
        const password = document.getElementById('regPassword').value.trim();
        const email = document.getElementById('regEmail').value.trim();

        try {
            const res = await fetch('/api/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: JSON.stringify({ username, password, email })
            });

            const data = await res.json();

            if (res.ok) {
                regResponse.classList.remove('text-danger');
                regResponse.classList.add('text-success');
                regResponse.textContent = 'Registrierung erfolgreich! Bitte jetzt einloggen.';
                regContainer.style.display = 'none';
            } else {
                regResponse.classList.remove('text-success');
                regResponse.classList.add('text-danger');
                regResponse.textContent = `Fehler: ${data.message}`;
            }
        } catch (err) {
            console.error(err);
            regResponse.textContent = 'Fehler bei der Registrierung.';
        }
    });
});