# Improof 

![logo](./public/assets/images/improof_A100.png)

Eine ausführliche Beschreibung des Projekts findest du in unserem [Frontend-Repository](https://github.com/BreffJaun/improof-FE).

**Improof** schließt die Lücke zwischen „Social Media“ und „professional Network“. Das Ziel ist es vor allem Quereinsteigern den Einstieg in die Berufswelt leichter machen. Auch Recruitern soll die Arbeit mit Berufsfeldern die stark von Quereinsteigern geprägt sind, die Suche nach Kandidaten mit passenden Fähigkeiten erleichtern.

## Installation

Um **Improof** zu clonen und zu starten, sollten [Git](https://git-scm.com) und [Node.js](https://nodejs.org/en/download/) auf dem Rechner installiert sein. Desweiteren muss entweder [MongoDB](https://www.mongodb.com/) auf dem Rechner installiert sein, oder es wird ein Link zu einer MongoDB-Datenbank (wie z.B. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas2)) benötigt. 

### Backend

Aus der Kommandozeile:

```bash
# Clone das Backend-Repository (hier mittels SSH Key) 
$ git clone git@github.com:BreffJaun/improof-BE.git

# Gehe in das Verzeichnis
cd  improof-BE

# Installiere Dependencies
$ npm install
```

Du musst nun eine `.env` Datei im Root-Verzeichnes anlegen. Darin sollen folgende Umgebungsvariablen angegeben werden:

DB_USER=          Dein MongoDB Benutzername   
DB_PASS=           Dein MongoDB Passwort    
DB_HOST=          Dein MongoDB Host     
DB_NAME=         Dein MongoDb Datenbank Name    
PORT=                  Port auf dem dein Localhost läuft
SECRET_JWT_KEY=   Legen deinen eigenen Schlüssel fest, mit dem du deinen Webtoken verschlüsselst   
SENDGRID_API_KEY= Füge hier deinen Sendgrid API-Key ein, welchen du auf der Sendgrid Seite erhältst  

CLOUDINARY_CLOUD_NAME= 
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

Wir haben bei diesem Projekt mit Cloudinary gearbeitet um Mediadateien in einer Cloud abspeichern zu können. Wenn du einen anderen Cloud Anbieter benutzen möchtest, kann es sein, dass diverse Stellen im Backend dafür angepasst werden müssen. Wir raten daher zu einem Cloudinary Account. 

BE_HOST = Trage hier den kompletten HOST ein, auf dem dein Backend läuft (Bsp.: "http://localhost:2404")

FE_HOST = Trage hier den kompletten HOST ein, auf dem dein Frontend läuft (Bsp.: "http://localhost:5173")

Wenn du die env. Datei angelegt und mit allen Information versehen hast, starte das den Server.

```bash
# Starte das Backend
$ nodemon server.js
```
