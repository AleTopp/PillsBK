/* Data Access Object (DAO) module */

import sqlite from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { Farmaco, Assunzione } from './models.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// open the database nella cartella data
const dbPath = path.join(__dirname, 'data', 'pillsbk.sqlite');
const db = new sqlite.Database(dbPath, (err) => {
  if (err) throw err;
});


export const listFarmaci = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Farmaco';
    db.all(sql, [], (err, rows) => {
      if (err)
        reject(err);
      else {
        const farmaci = rows.map((f) => new Farmaco(f.id, f.nome, f.dosaggio, f.indicazioni, f.mesi_esclusi, f.ordine));
        resolve(farmaci);
      }
    });
  });
}

export const getFarmaco = (id) => {
  return new Promise ((resolve, reject) => {
    const sql = 'SELECT * FROM Farmaco WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve({error: "Farmaco does not exist."});
      } else {
        resolve(new Farmaco(row.id, row.nome, row.dosaggio, row.indicazioni, row.mesi_esclusi, row.ordine));
      }
    });
  });
}

export const getCompleteFarmaco = (id) => {
  return new Promise (async (resolve, reject) => {
    const ref = await getFarmaco(id);
    let farmaco = {...ref};
    if (ref.error) {
      resolve(ref);
    }

    const sql = 'SELECT * FROM Assunzione WHERE farmaco_id = ?';
    db.all(sql, [id], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        farmaco.assunzioni = [];
        rows.map((r) => {
          let ass = new Assunzione(r.id, r.timestamp, ref, r.stato);
          farmaco.assunzioni.push(ass);
        })
        resolve(farmaco);
      }
    });
  });
}

export const listAssunzioni = () => {
  return new Promise ((resolve, reject) => {
    let farmaci = [];
    const sql = 'SELECT * FROM Assunzione';
    db.all(sql, async (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const assunzioni = await Promise.all(rows.map(async (r) => {
          let f = farmaci[r.farmaco_id];
          if (f === undefined) {
            f = await getFarmaco(r.farmaco_id);
            farmaci[f.id] = f;
          }

          return new Assunzione(r.id, r.timestamp, f, stato);
        }));
        resolve(assunzioni);
      }
    });
  });
}

export const addFarmaco = (farmaco) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO Farmaco(nome, dosaggio, indicazioni, mesi_esclusi, ordine) VALUES (?,?,?,?,?)';
    const mesi_esclusi = farmaco.mesi_esclusi.join(',');

    db.run(sql, [farmaco.nome, farmaco.dosaggio, farmaco.indicazioni, mesi_esclusi, farmaco.ordine], function(err) {
      if (err)
        reject(err);
      else 
        resolve(this.lastID);
    });
  });
}

export const addAssunzione = (assunzione) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO Assunzione(timestamp, farmaco_id, stato) VALUES (?,?,?)';
    db.run(sql, [assunzione.timestamp, assunzione.farmaco.id, assunzione.stato], function(err) {
      if (err)
        reject(err);
      else 
        resolve(this.lastID);
    });
  });
}