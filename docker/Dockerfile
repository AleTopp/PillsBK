# Usa l'immagine ufficiale Node.js
FROM node:18-alpine

# Imposta la directory di lavoro
WORKDIR /app

# Copia i file package.json e package-lock.json (se esiste)
COPY package*.json ./

# Installa le dipendenze
RUN npm ci --only=production

# Copia il resto dell'applicazione
COPY . .

# Crea la directory per il database SQLite
RUN mkdir -p /app/data

# Rendi eseguibile lo script di avvio
RUN chmod +x start.sh

# Espone la porta 3001 (o quella che usi)
EXPOSE 3001

# Crea un utente non-root per sicurezza
RUN addgroup -g 1001 -S nodejs
RUN adduser -S node -u 1001

# Cambia ownership dei file all'utente node
RUN chown -R node:nodejs /app
USER node

# Script per inizializzare il DB e avviare l'app
CMD ["./start.sh"]