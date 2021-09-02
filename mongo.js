const mongoose = require('mongoose');
const CONNECTION_STRING = process.env.MONGO_DB_URI;

//mongodb connection
mongoose.connect(CONNECTION_STRING)
  .then(() => {
    console.log('Database connected');
  }).catch((err) => {
    console.error(err);
  });

process.on('uncaughtException', () => mongoose.connection.disconnect());

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