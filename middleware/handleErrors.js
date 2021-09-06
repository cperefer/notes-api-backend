const ERROR_HANDLERS = {
  CastError: (res) => res.status(400).send({error: 'id is malformed'}),
  JsonWebTokenError: (res) => res.status(401).json({error: 'token invalid'}),
  TokenExpirerError: (res) => res.status(401).json({error: 'token expired'}),
  ValidationError: (res, {message}) => res.status(409).send({error: message}),
  defaultError: (res) => res.status(500).end(),
};

// eslint-disable-next-line
module.exports = (error, request, response, next) => {
  console.log(error.name);

  const handler = ERROR_HANDLERS[error.name] || ERROR_HANDLERS.defaultError;
  handler(response, error);
};