FROM node:22-alpine

# Copies app files
WORKDIR /app
COPY . .

# Install dependencies and rebuilds sqlite3
RUN apk add --no-cache python3 make g++ && \
    npm ci --only=production && npm rebuild sqlite3 && \
    apk del python3 make g++

# Edits ownership
RUN chmod +x start.sh && \
    chown -R node:node /app

# Espose API server port
EXPOSE 3001
    
# Runs start script
USER node
CMD ["./start.sh"]