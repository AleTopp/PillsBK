import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import {check, validationResult} from 'express-validator';
import {addAssunzione, addFarmaco, getCompleteFarmaco, listAssunzioni, listFarmaci} from './dao.mjs';
import { Assunzione, Farmaco } from './models.mjs';

// Init
const app = express();
const port = 3001;

// Middlewares
app.use(express.json());
app.use(morgan('dev'));

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessState: 200
};

app.use(cors(corsOptions));

/* ROUTES */

// GET /api/farmaci
app.get('/api/farmaci', (req, res) => {
  listFarmaci()
  .then(farmaci => res.json(farmaci))
  .catch(() => res.status(500).end());
});

// GET /api/farmaci/<id>
app.get('/api/farmaci/:id', async (req, res) => {
  try {
    const farmaco = await getCompleteFarmaco(req.params.id);
    if(farmaco.error) {
      res.status(404).json(farmaco);
    } else {
      res.json(farmaco);
    }
  }
  catch {
    res.status(500).end();
  }
});

// POST /api/farmaci
app.post('/api/farmaci', [
  check('nome').notEmpty({ignore_whitespace: true}),
  check('dosaggio').notEmpty({ignore_whitespace: true}),
  check('indicazioni').notEmpty({ignore_whitespace: true}),
  check('ordine').isInt()

], async (req, res) => {
  console.log(req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }

  if (req.body.mesi_esclusi.length > 0 && !Number.isInteger(req.body.mesi_esclusi) && !req.body.mesi_esclusi.split(',').all((n) => Number.isInteger(n))) {
    return res.status(422).json({errors: [{error: "Field mesi_esclusi not valid. Should be integer or comma-separated integers."}]});
  }

  const f = req.body;

  try {
    const id = await addFarmaco(new Farmaco(-1, f.nome, f.dosaggio, f.indicazioni, f.mesi_esclusi, f.ordine));
    res.status(201).location(id).end();
  } catch(e) {
    console.error(`ERROR: ${e.message}`);
    res.status(503).json({error: 'Impossible to create the farmaco.'});
  }
});

// POST /api/farmaci/<id>/assunzione
app.post('/api/farmaci/:id/assunzione', [
  check('timestamp').isDate({format: "YYYY-MM-DD", strictMode: true}),
  check('stato').isInt({min: 0, max: 3})
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }

  const farmacoId = req.params.id;
  try {
    const id = await addAssunzione(new Assunzione(-1, req.body.timestamp, {id: farmacoId}, req.body.stato));
    res.status(201).location(id).end();
  } catch(e) {
    res.status(503).json({error: e.message});
  }
});

// GET /api/assunzioni
app.get('/api/assunzioni', (req, res) => {
  listAssunzioni()
  .then(assunzioni => res.json(assunzioni))
  .catch(() => res.status(500).end());
});

// GET /api/giornata
app.get('/api/giornata', (req, res) => {
  const nowMonth = new Date().getMonth() + 1;
  
  listFarmaci()
    .then(farmaci => res.status(200).json(farmaci.filter((f) => !(nowMonth in f.mesi_esclusi))))
    .catch(() => res.status(500).end());
})

// POST /api/giornata
app.post('/api/giornata', [
  check('date').isDate({format: "YYYY-MM-DD", strictMode: true}).not().isAfter((new Date()).toDateString()),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({error: "Data non valida nel formato (YYYY-MM-DD) o nel tempo (non futuro)"});
  }

  let farmaci = await listFarmaci();
  let proms = [];

  for (const key in req.body.farmaci) {
    const farmacoTrovato = farmaci.find(f => f.nome.toLowerCase() === key.toLowerCase());
    if (farmacoTrovato) {
      try {
        proms.push(addAssunzione(new Assunzione(-1, req.body.date, {id: farmacoTrovato.id}, req.body.farmaci[key])));
        farmaci = farmaci.filter(f => f.id !== farmacoTrovato.id);
      } catch (e) {
        if (e.message.includes("Invalid stato")) {
          return res.status(400).json({error: `Invalid stato for ${farmacoTrovato.nome}`})
        }
        else {
          return res.status(503).json({error: e.message});
        }
      }
    }
    else {
      return res.status(400).json(`Farmaco ${key} not found. Rejecting all requests.`)
    }
  }

  await Promise.all(proms);

  res.status(200).end();
})

// Start server
app.listen(port, () => { console.log(`API server started at http://localhost:${port}`); });