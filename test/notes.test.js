const mongoose = require('mongoose');
const {server} = require('../index');
const Note = require('../models/Note');
const {api, INITIAL_NOTES, getAllContentsFromNotes} = require('./helpers');

beforeEach(async() => {
  await Note.deleteMany({});

  for (let note of INITIAL_NOTES) {
    const noteObject = new Note(note);
    await noteObject.save();
  }
});

afterAll(() => {
  server.close();
  mongoose.connection.close();
});

describe('GET /api/notes', () => {
  it('Notes should be returned as JSON', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('Should be two notes', async () => {
    const response = await api.get('/api/notes');
    expect(response.body).toHaveLength(INITIAL_NOTES.length);
  });

  it('First note should contain an string given', async () => {
    const expectedString = 'Nota sobre manzanas';

    const {contents} = await getAllContentsFromNotes();
    expect(contents).toContain(expectedString);
  });
});

describe('POST /api/notes', () => {
  it('Should add a new note', async() => {
    const newNote = {
      content: 'Nota insertada desde test',
      important: false,
    };

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const {contents} = await getAllContentsFromNotes();
    expect(contents).toContain('Nota insertada desde test');
  });

  it('Note without content should not be added', async() => {
    const newNote = {
      important: false,
    };

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(400);

    const response = await api.get('/api/notes');
    expect(response.body).toHaveLength(INITIAL_NOTES.length);
  });
});

describe('DELETE /api/notes', () => {
  it('Note should be deleted', async() => {
    const {response} = await getAllContentsFromNotes(),
      {body: notes} = response,
      noteToDelete = notes[0];

    await api
      .delete(`/api/notes/${noteToDelete.id}`)
      .expect(204);

    const {contents, response: secondResponse} = await getAllContentsFromNotes();
    expect(secondResponse.body).toHaveLength(INITIAL_NOTES.length - 1);
    expect(contents).not.toContain(noteToDelete.content);
  });

  it('Should return error 400 if ID does not exist', async() => {
    await api
      .delete('/api/notes/123')
      .expect(400);

    const {response} = await getAllContentsFromNotes();
    expect(response.body).toHaveLength(INITIAL_NOTES.length);
  });
});