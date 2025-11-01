import { checkLogin} from './checkLogin.js';

checkLogin(true, false);

// --- Login ---
document.getElementById("loginContainer").addEventListener("submit", async (e) => {
  e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const responsePara2 = document.getElementById('responseLogin');

    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (response.ok) {

        const check = await fetch('/api/user/profile', { credentials: 'include' });
        if (check.ok){
          window.location.href = 'fahrten.html'
        }
        } else {
          responsePara2.textContent = "Fehler beim Login: " + (data.nachricht || data.message);
        }
    } catch (error) {
      console.error("Fehler beim Request:", error);
      alert("Server konnte nicht erreicht werden.");
    }
    });

    // --- Registrierung anzeigen/verstecken ---
    document.getElementById('toggleRegisterBtn').addEventListener('click', () => {
      const regContainer = document.getElementById('registerContainer');
      regContainer.style.display = regContainer.style.display === 'none' ? 'block' : 'none';
    });

    // --- Registrierung absenden ---
    document.getElementById('registerBtn').addEventListener('click', async () => {
      const username = document.getElementById('regUsername').value;
      const password = document.getElementById('regPassword').value;
      const email = document.getElementById('regEmail').value;
      const regResponse = document.getElementById('regResponse');

      try {
        const res = await fetch('/api/user/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=UTF-8' },
          credentials: 'include',
          body: JSON.stringify({ username, password, email })
        });

        const data = await res.json();
        if (res.ok) {
          regResponse.textContent = 'Registrierung erfolgreich! Bitte jetzt einloggen.';
          document.getElementById('registerContainer').style.display = 'none';
        } else {
          regResponse.textContent = 'Fehler: ' + (data.message);
        }
      } catch (err) {
        regResponse.textContent = 'Fehler bei der Registrierung.';
        console.error(err);
      }
});