const notesRouter = require('express').Router();
const userExtractor = require('../middleware/userExtractor');
const Note = require('../models/Note');
const User = require('../models/User');

notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({}).populate('user', {
    username: 1,
    name: 1,
  });
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

notesRouter.post('/', userExtractor, async (request, response, next) => {
  const {
    content,
    important = false,
  } = request.body;

  if (!content) {
    return response.status(400).json({
      error: 'required "content" field is missing',
    });
  }
  const user = await User.findById(request.userId);
  const newNote = new Note({
    date: new Date().toISOString(),
    content,
    important,
    user: user._id,
  });

  try {
    const savedNote = await newNote.save();
    user.notes = user.notes.concat(savedNote._id);
    await user.save();
    response.json(savedNote);
  } catch (err) {
    next(err);
  }
});

notesRouter.put('/:id', userExtractor, (request, response, next) => {
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

notesRouter.delete('/:id', userExtractor, (request, response, next) => {
  const {id} = request.params;

  Note.findByIdAndRemove(id).then(() => {
    response.status(204).end();
  }).catch((err) => next(err));
});

module.exports = notesRouter;