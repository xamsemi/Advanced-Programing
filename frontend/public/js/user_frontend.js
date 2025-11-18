// Datei: /public/js/user.js

async function loadUsers() {
  try {
    
    const response = await fetch("/api/user", { credentials: "include" });
    console.log("Response beim Laden der Mitglieder:", response.status);
    if (!response.ok) {
      throw new Error(`Fehler beim Laden: ${response.status}`);
    }

    const json = await response.json();
    const users = json.data;

    const tbody = document.getElementById("user-table-body");
    tbody.innerHTML = "";

    if (!users || users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-secondary">Keine Mitglieder gefunden.</td></tr>`;
      return;
    }
//${user.user_type || "-"} 
    for (const user of users) {
      //const response = await fetch(`/api/user/${user.user_id}`, { credentials: "include" });
      //console.log("Response beim Laden der Mitglieder:", response.status);
      
      //if (!response.ok) {
      //  throw new Error(`Fehler beim Laden: ${response.status}`);
      //}

      //const json_user = await response.json();
     // const company = json_user.data;


     
      const row = document.createElement("tr");

      row.innerHTML = `
        
        <td>${user.username}</td>
        <td>${user.address}</td>
        <td>${user.email}</td>
        <td>${user.user_role}</td>
        <td>${user.created_at.substring(0, 10)}</td>
        <td class="text-center">
          <a href="mitglied_bearbeiten.html?id=${user.user_id}" class="btn btn-sm btn-outline-warning me-2">Bearbeiten</a>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.user_id})">Löschen</button>
        </td>
      `;
      tbody.appendChild(row);   
    };
  } catch (error) {
    console.error("Fehler beim Laden der Mitglieder:", error);
    console.log("Response:", response?.status);
    const tbody = document.getElementById("user-table-body");
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Fehler beim Laden der Daten von user.js</td></tr>`;
  }
}

async function deleteUser(id) {
  if (!confirm("Dieses Mitglied wirklich löschen?")) return;

  try {
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Mitglied gelöscht!");
      loadUsers();
    } else {
      alert("Fehler beim Löschen.");
    }
  } catch (err) {
    console.error("Fehler beim Löschen:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadUsers);
