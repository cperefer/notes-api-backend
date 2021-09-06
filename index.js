require('dotenv').config();
require('./mongo');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const express = require('express');
const logger = require ('./loggerMiddleware');
const cors = require('cors');

//middlewares
const notFound = require('./middleware/notFound');
const handleErrors = require('./middleware/handleErrors');

//Controllers
const notesRouter = require('./controllers/notes');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');

const app = express();

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

app.use('/api/notes', notesRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);

app.use(notFound);
app.use(Sentry.Handlers.errorHandler());
app.use(handleErrors);

const PORT = process.env.PORT;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = {app, server};