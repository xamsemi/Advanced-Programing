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
| Admin  | Busfahrten planen | Mitglieder können sich für Fahrten anmelden und Informationen zum Ausflug erhalten |
| Admin  | Busfahrten entfernen | Alte oder abgesagte Fahrten können gelöscht werden |
| Admin  | Automatische Mail an Busunternehmen senden | E-Mail-Anfrage an Busunternehmen, um geplante Ausflüge anzufragen |
| User   | Für Busfahrt anmelden | Es wird ein Platz im Bus reserviert |
| User   | Für Busfahrt abmelden | Es wird ein Platz freigegeben |

---

## 💻 Lokale Entwicklung

### Voraussetzungen
- **Node.js** und **npm**
- **nginx**
- **git**

---

## SSL Zertifikate erstellen
Ins Verzeichniss ssl navigieren. dDort mit z.B. bash folgende Befehle ausführen
| Aktion | Befehl |
|--------|--------|
| Zertifikate erzeugen  | `openssl req -x509 -nodes -days 365 -newkey rsa:2048 \-keyout nginx-selfsigned.key \-out nginx-selfsigned.crt` |


## 🚀 Start der Anwendung

1. **Repository klonen:**
   ```bash
   git clone <repository-url>
   cd <projektname>
   ```

2. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```

3. **nginx starten:**
   ```bash
   .\nginx.exe
   ```

4. **nginx stoppen:**
   ```bash
   .\nginx.exe -s quit
   ```
5. **Server starten:**
   ```bash
   node .\server.js
   ```
6. **Seite im browser öffnen:**
   ```Browser
   http://localhost
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

### 🧩 npm / Node.js
| Aktion | Befehl |
|--------|--------|
| Pakete installieren | `npm install` |

---


## 🧑‍💻 Autoren
Projektteam: *Sabine, Max, Daniel*  
Stand: *Oktober 2025*

