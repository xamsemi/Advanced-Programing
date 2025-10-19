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

### Voraussetzungen

- Programme: **npm**, **git** und **Docker Desktop**
- Editor: **vscode**

---

## 🚀 Start der Anwendung

1. **Repository klonen:**

   ```bash
   git clone <repository-url>
   cd <projektname>
   ```

2. **Stack starten:**

   ```bash
   docker-compose up -d
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

### 🐳 Docker-Befehle

| Aktion | Befehl |
|--------|--------|
|Stack starten (docker-compose.yml) | `docker-compose up -d` |

Shell im Docker-Container

| Aktion | Befehl |
|--------|--------|
| http message an Webserver | `curl -d '{"text":"hallo"}' -H "Content-Type: application/json"  -X POST http://host.docker.internal:3000/api/message` |

---

### 🧩 npm

| Aktion | Befehl |
|--------|--------|
| Paket installieren | `npm install <Paket>` |
| Paket deinstallieren | `npm purge <Paket>` |

---

## 📂 Projektstruktur (empfohlen)

```
|   .gitignore
|   docker-compose.yml
|   README.md
|   
+---backend
|   |   package-lock.json
|   |   package.json
|   |   server.js
|   |   swagger-output.json
|   |   swagger.js          
|   \---public
|       |   favicon.ico
|       |   
|       +---css
|       +---img
|       \---js
+---db
|   \---init
|           create_shema.sql
|           
+---frontend
|   \---public
|       |   favicon.ico
|       |   index.html
|       +---img      
|       \---js
+---mokup
|       database.drawio
|       
+---nginx
    +---conf
    |       fastcgi.conf
    |       nginx.conf
    |       
    \---logs
```

---

## 🧑‍💻 Autoren

Projektteam: *Sabine, Max, Daniel*  
Stand: *Oktober 2025*
