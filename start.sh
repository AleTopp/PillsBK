#!/bin/sh

echo "Inizializzazione database..."
node data/init.mjs

if [ $? -eq 0 ]; then
    echo "Database inizializzato correttamente. Avvio applicazione..."
    node index.mjs
else
    echo "Errore nell'inizializzazione del database"
    exit 1
fi