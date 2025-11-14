# 🚌 Busreservierungssystem für Vereinsfahrten

## 📖 Einführung

Unser Projekt beschäftigt sich mit der Entwicklung eines **Busreservierungssystems für Vereinsfahrten**.  
Ziel ist es, den Mitgliedern eine einfache Möglichkeit zu geben, **Fahrten auszuwählen und Sitzplätze zu reservieren**.

---

## ⚙️ App-Funktionen

- **Benutzer-Registrierung und -Anmeldung**
  - User können sich registrieren und für verfügbare Fahrten anmelden.
- **Admin-Verwaltung**
  - Admins können Ausflüge (Busfahrten) einstellen und entfernen.
  - Automatische E-Mail-Anfragen an Busunternehmen können erstellt und versendet werden.
- **Sitzplatzverwaltung**
  - Reservierung und Stornierung von Sitzplätzen durch User.
  
---

## 🧩 User-Stories

| Rolle  | Ziel | Nutzen |
|--------|------|--------|
| Admin  | Busfahrten hinzufügen/planen | Mitglieder können sich für Fahrten anmelden und Informationen zum Ausflug erhalten |
| Admin  | Übersicht anzeigen | Informationen über die Busfahrt erhalten |
| Admin  | Busfahrten entfernen | Alte oder abgesagte Fahrten können gelöscht werden |
| Admin  | Benutzer löschen | Kann registrierte Benutzer löschen |
| Admin  | Automatische Mail an Busunternehmen senden | E-Mail-Anfrage an Busunternehmen, um geplante Ausflüge anzufragen |
| User   | Für Busfahrt anmelden | Es wird ein Platz im Bus reserviert |
| User   | Für Busfahrt abmelden | Es wird ein Platz freigegeben |
| User   | Benutzeraccount erstellen | Kann sich an Seite anmelden und Ausflug buchen |
| User   | Übersicht Busfahrten anzeigen | Informationen über die Busfahrt erhalten |

---

## 💻 Lokale Entwicklung

### Benötige Software

- **Docker Desktop**
- **Node.js** und **npm**
- **nginx**
- **git**

### SSL Zertifikate erstellen

Ins Verzeichniss ssl navigieren. Dort mit z.B. bash folgende Befehle ausführen

| Aktion | Befehl |
|--------|--------|
| Zertifikate erzeugen  | `openssl req -x509 -nodes -days 365 -newkey rsa:2048 \-keyout nginx-selfsigned.key \-out nginx-selfsigned.crt` |

---

### Repository

1. **Repository klonen:**

   ```bash
   git clone https://github.com/xamsemi/Advanced-Programing.git
   cd Advanced-Programing
   ```

2. **Abhängigkeiten Node-Server installieren:**

   ```bash
   cd backend
   npm install
   ```

## 🚀 Start der Anwendungen

### Lokaler Server

1. **nginx starten:**

   ```bash
   .\nginx.exe
   ```

2. **nginx stoppen:**

   ```bash
   .\nginx.exe -s quit
   ```

3. **Node-Server starten:**

   ```bash
   node .\server.js
   ```

4. **Seite im Browser öffnen:**

   ```Browser
   http://localhost:8443 //Nginx - Frontend
   http://localhost:3000 //Backend
   ```

### Docker-Container starten

**Container mysql, node, nginx mit Compose starten:**

   ```bash
   docker-compose up -d
   ```

### Seite im Browser öffnen

Achtung Seite muss vertraut werden da das Zertifikat selbst erstellt wurde!

   ```Browser
   https://localhost:8443 //Nginx - Frontend
   https://localhost:3000 //Backend
   https://localhost:3006 //DB
   ```

---

## 🧠 Wichtige Befehle

### 🔧 Git-Befehle

| Aktion | Befehl |
|--------|--------|
| Status prüfen | `git status` |
| Neue Dateien/Ordner hinzufügen | `git add .` |
| Änderungen committen | `git commit -m "Beschreibung der Änderung"` |
| Änderungen hochladen | `git push` |
| Updates vom Remote laden | `git pull` |

> ⚠️ **Achtung:** Achte darauf, in welchem Branch du dich befindest, bevor du `push` ausführst.

---

## 🧑‍💻 Autoren

Projektteam: *Sabine, Max, Daniel*  
Stand: *Oktober 2025*
