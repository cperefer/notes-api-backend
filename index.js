const express = require('express');
const logger = require ('./loggerMiddleware');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

let notes = [
  {
    id: 1,
    content: 'Qué haces con los huevos fuera?',
    date: '2019-05-30T17:30:31.098Z',
    important: true,
  },
  {
    id: 2,
    content: 'Es por las notas',
    date: '2019-05-30T18:39:34.091Z',
    important: false,
  },
  {
    id: 3,
    content: 'Qué notas???',
    date: '2019-05-30T19:20:14.298Z',
    important: true,
  },
  {
    id: 4,
    content: 'Airecillo en las pelotas!!!',
    date: '2019-05-30T19:20:14.298Z',
    important: true,
  },
];

app.get('/', (request,response) => {
  response.send('<h1>Hello!!</h1>');
});

app.get('/api/notes', (request,response) => {
  response.json(notes);
});

app.get('/api/notes/:id', (request,response) => {
  const id = Number(request.params.id),
    note = notes.find((note) => note.id === id);

  if (note) {
    response.json(note);
  } else {
    response.status(404).end();
  }
});

app.post('/api/notes', (request,response) => {
  const note = request.body,
    ids = notes.map(note => note.id),
    maxId = Math.max(...ids);

  const newNote = {
    id: maxId + 1,
    date: new Date().toISOString(),
    content: note.content,
    important: note.important || false,
  };

  notes = [...notes, newNote,];

  response.json(newNote);
});

//just a change to test
app.delete('/api/notes/:id', (request,response) => {
  const id = Number(request.params.id);

  notes = notes.filter((note) => note.id !== id);

  response.status(204).end();    
});

app.use((request, response) => {
  response.status(404).json({
    error: 'Not Found',
  });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
