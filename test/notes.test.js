const mongoose = require('mongoose');
const {server} = require('../index');
const Note = require('../models/Note');
const {api, INITIAL_NOTES, getAllContentsFromNotes, doLogin} = require('./helpers');
let jwtToken;

describe('Notes tests', () => {
  beforeAll(async () => {
    const ret = await doLogin();
    jwtToken = ret.body.token;
  });

  beforeEach(async() => {
    await Note.deleteMany({});

    for (let note of INITIAL_NOTES) {
      const noteObject = new Note(note);
      await noteObject.save();
    }
  });

  afterAll(async() => {
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
        .set('Authorization', `Bearer ${jwtToken}`)
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
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(newNote)
        .expect(400);

      const response = await api.get('/api/notes');
      expect(response.body).toHaveLength(INITIAL_NOTES.length);
    });
  });

  describe('PUT /api/notes', () => {
    it.only('Should modify an existent note', async() => {
      const newNote = {
        content: 'Nota modificada',
        important: true,
      };

      const {response} = await getAllContentsFromNotes(),
        {id} = response.body[0];

      await api
        .put(`/api/notes/${id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(newNote)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const {contents} = await getAllContentsFromNotes();
      expect(contents).toContain(newNote.content);
    });

    it.only('Should get 401 if not logged in', async() => {
      const newNote = {
        content: 'Nota modificada',
        important: true,
      };

      const {response} = await getAllContentsFromNotes(),
        {id} = response.body[0];

      await api
        .put(`/api/notes/${id}`)
        .send(newNote)
        .expect(401)
        .expect('Content-Type', /application\/json/);

      const {contents} = await getAllContentsFromNotes();
      expect(contents).not.toContain(newNote.content);
    });

    it.only('Should get 400 if note doesn\'t exists', async() => {
      const newNote = {
        content: 'Nota modificada',
        important: true,
      };

      await api
        .put('/api/notes/aaabb33}')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(newNote)
        .expect(400)
        .expect('Content-Type', /application\/json/);

      const {contents} = await getAllContentsFromNotes();
      expect(contents).not.toContain(newNote.content);
    });
  });

  describe('DELETE /api/notes', () => {
    it('Note should be deleted', async() => {
      const {response} = await getAllContentsFromNotes(),
        {body: notes} = response,
        noteToDelete = notes[0];

      await api
        .delete(`/api/notes/${noteToDelete.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(204);

      const {contents, response: secondResponse} = await getAllContentsFromNotes();
      expect(secondResponse.body).toHaveLength(INITIAL_NOTES.length - 1);
      expect(contents).not.toContain(noteToDelete.content);
    });

    it('Should return error 400 if ID does not exist', async() => {
      await api
        .delete('/api/notes/123')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400);

      const {response} = await getAllContentsFromNotes();
      expect(response.body).toHaveLength(INITIAL_NOTES.length);
    });

    it('Should return error 401 if user is not logged in', async() => {
      await api
        .delete('/api/notes/123')
        .expect(401);

      const {response} = await getAllContentsFromNotes();
      expect(response.body).toHaveLength(INITIAL_NOTES.length);
    });
  });
});