const jwt = require('jsonwebtoken');

module.exports = (request, response, next) => {
  const authorization = request.get('authorization');
  let token = '';
  if (authorization && authorization.toLowerCase().startsWith('bearer')) {
    token = authorization.split(' ')[1];
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.SECRET);
  } catch (err) {
    return next(err);
  }

  if (!token || !decodedToken.id) {
    return response.status(401).json({error: 'token missing or invalid'});
  }

  const {id: userId} = decodedToken;

  request.userId = userId;
  next();
};