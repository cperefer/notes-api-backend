const supertest = require('supertest');
const {app} = require('../index');
const api = supertest(app);

const INITIAL_NOTES = [
  {
    content: 'Nota sobre manzanas',
    important: true,
    date: new Date(),
  },
  {
    content: 'Nota sobre pollos',
    important: true,
    date: new Date(),
  }
];

const getAllContentsFromNotes = (async () => {
  const response = await api.get('/api/notes');
  return {
    contents: response.body.map((note) => note.content),
    response,
  };
});

module.exports = {
  api,
  INITIAL_NOTES,
  getAllContentsFromNotes,
};