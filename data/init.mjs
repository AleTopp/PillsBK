import sqlite from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database nella cartella data
const dbPath = path.join(__dirname, 'pillsbk.sqlite');

const db = new sqlite.Database(dbPath, (err) => {
  if (err) throw err;
  console.log(`Database connesso: ${dbPath}`);
});

const sql = `
CREATE TABLE IF NOT EXISTS Farmaco (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    dosaggio TEXT NOT NULL,
    indicazioni TEXT NOT NULL,
    mesi_esclusi TEXT NOT NULL,
    ordine INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS Assunzione (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    farmaco_id INTEGER NOT NULL,
    stato INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (farmaco_id) REFERENCES farmaco(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_assunzioni_timestamp ON Assunzione(timestamp);
CREATE INDEX IF NOT EXISTS idx_assunzioni_farmaco ON Assunzione(farmaco_id);
CREATE INDEX IF NOT EXISTS idx_farmaco_ordine ON Farmaco(ordine);
`;

db.exec(sql, function(err) {
  if (err) {
    console.log("Errore durante l'init del DB: " + err);
    process.exit(1);
  } else {
    db.close((err) => {
      if (err) {
        console.error("Errore chiusura DB:", err);
      }
      process.exit(0);
    });
  }
});