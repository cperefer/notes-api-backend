require('dotenv').config();
require('./mongo');

const express = require('express');
const logger = require ('./loggerMiddleware');
const cors = require('cors');
const Note = require('./models/Note');

//middlewares
const notFound = require('./middleware/notFound');
const handleErrors = require('./middleware/handleErrors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.get('/', (request,response) => {
  response.send('<h1>Hello!!</h1>');
});

app.get('/api/notes', (request,response) => {
  Note.find({})
    .then((notes) => response.json(notes));
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

app.post('/api/notes', (request,response) => {
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

  newNote.save().then((savedNote) => (response.json(savedNote)));
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

app.use(handleErrors);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
