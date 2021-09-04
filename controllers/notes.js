const notesRouter = require('express').Router();
const Note = require('../models/Note');

notesRouter.get('/', async (request, response) => {
  console.log('van a pensar que eres tonto');
  const notes = await Note.find({});
  response.json(notes);
});

notesRouter.get('/:id', (request, response, next) => {
  const {id} = request.params;

  Note.findById(id).then((note) => {
    if (note) {
      response.json(note);
    } else {
      response.status(404).end();
    }
  }).catch((err) => next(err));
});

notesRouter.post('/', async (request, response, next) => {
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

notesRouter.put('/:id', (request, response, next) => {
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

notesRouter.delete('/:id', (request, response, next) => {
  const {id} = request.params;

  Note.findByIdAndRemove(id).then(() => {
    response.status(204).end();
  }).catch((err) => next(err));
});

module.exports = notesRouter;