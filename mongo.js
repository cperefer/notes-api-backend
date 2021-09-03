const mongoose = require('mongoose');

const {MONGO_DB_URI, MONGO_DB_URI_TEST, NODE_ENV} = process.env,
  CONNECTION_STRING = NODE_ENV === 'test'
    ? MONGO_DB_URI_TEST
    : MONGO_DB_URI;

//mongodb connection
mongoose.connect(CONNECTION_STRING)
  .then(() => {
    console.log('Database connected');
  }).catch((err) => {
    console.error(err);
  });

process.on('uncaughtException', () => mongoose.connection.close());

// Note.find({})
//   .then((result) => {
//     console.log(result);
//     mongoose.connection.close();
//   });
// const note = new Note({
//   content: 'Fua, la virgen',
//   date: new Date(),
//   important: true,
// });

// note.save()
//   .then((result) => {
//     console.log(result);
//     mongoose.connection.close();
//   }).catch((err) => {
//     console.error(err);
//   });