# Tabelle del Database

## Tabella: Farmaco
- `nome`: Nome del farmaco
- `dosaggio`: Dosaggio (mg/ml)
- `indicazioni`: Indicazioni di assunzione
- `mesi_esclusi`: Elenco CSV dei mesi di non assunzione
- `ordine`: Ordine di assunzione giornaliera

## Tabella: Assunzione
- `timestamp`: Data e ora dell'assunzione
- `farmaco`: Riferimento al farmaco
- `stato`: Stato dell'assunzione:
  - Non registrato (0)
  - Assunto (1)
  - Dimenticato (2)
  - Non necessario (3)

## SQL per la creazione delle tabelle

```sql
-- Tabella per i farmaci
CREATE TABLE Farmaco (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    dosaggio TEXT NOT NULL,
    indicazioni TEXT NOT NULL,
    mesi_esclusi TEXT NOT NULL,
    ordine INTEGER NOT NULL
);

-- Tabella per le assunzioni
CREATE TABLE Assunzione (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    farmaco_id INTEGER NOT NULL,
    stato INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (farmaco_id) REFERENCES farmaco(id) ON DELETE CASCADE
);

-- Indici per migliorare le performance
CREATE INDEX idx_assunzioni_timestamp ON assunzioni(timestamp);
CREATE INDEX idx_assunzioni_farmaco ON assunzioni(farmaco_id);
CREATE INDEX idx_farmaco_ordine ON farmaco(ordine);
```