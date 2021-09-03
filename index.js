require('dotenv').config();
require('./mongo');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const express = require('express');
const logger = require ('./loggerMiddleware');
const cors = require('cors');
const Note = require('./models/Note');

const notFound = require('./middleware/notFound');
const handleErrors = require('./middleware/handleErrors');

const app = express();
//middlewares
Sentry.init({
  dsn: 'https://ed8399d75334473caf17c15b65bb8e3d@o986851.ingest.sentry.io/5943609',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

app.use(cors());
app.use(express.json());
app.use(logger);

app.get('/', (request, response) => {
  response.send('<h1>Hello!!</h1>');
});

app.get('/api/notes', async (request, response) => {
  const notes = await Note.find({});
  response.json(notes);
});

app.get('/api/notes/:id', (request, response, next) => {
  const {id} = request.params;

  Note.findById(id).then((note) => {
    if (note) {
      response.json(note);
    } else {
      response.status(404).end();
    }
  }).catch((err) => next(err));
});

app.post('/api/notes', async (request, response, next) => {
  const note = request.body;

  if (!note.content) {
    return response.status(400).json({
      error: 'required "content" field is missing',
    });
  }

  const newNote = new Note({
    date: new Date().toISOString(),
    content: note.content,
    important: note.important || false,
  });

  try {
    const savedNote = await newNote.save();
    response.json(savedNote);
  } catch (err) {
    next(err);
  }
});

app.put('/api/notes/:id', (request, response, next) => {
  const {id} = request.params,
    note = request.body;

  const newNoteInfo = {
    content: note.content,
    important: note.important,
  };

  Note.findByIdAndUpdate(id, newNoteInfo, {new: true})
    .then((result) => {
      response.json(result);
    }).catch((err) => {
      next(err);
    });
});

app.delete('/api/notes/:id', (request, response, next) => {
  const {id} = request.params;

  Note.findByIdAndRemove(id).then(() => {
    response.status(204).end();
  }).catch((err) => next(err));

});

app.use(notFound);
app.use(Sentry.Handlers.errorHandler());
app.use(handleErrors);

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = {app, server};