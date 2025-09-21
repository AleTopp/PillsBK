# Docker Setup

Questa cartella contiene i file per la containerizzazione dell'applicazione PillsBK.

## File inclusi:
- `Dockerfile`: Definizione dell'immagine Docker
- `docker-compose.yml`: Orchestrazione del container
- `.dockerignore`: File da escludere dal build context

## Come utilizzare:

### Dalla cartella docker:
```bash
cd docker
docker-compose up --build
```

### Dalla cartella root del progetto:
```bash
docker-compose -f docker/docker-compose.yml up --build
```

## Accesso all'applicazione:
- URL: http://localhost:3001
- Il database SQLite sarà persistito nella cartella `../data`

## Comandi utili:
```bash
# Avvio in background
docker-compose up -d

# Stop del container
docker-compose down

# Rebuild forzato
docker-compose up --build --force-recreate

# Visualizza log
docker-compose logs -f
```