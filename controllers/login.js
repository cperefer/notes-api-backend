const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const User = require('../models/User');

loginRouter.post('/', async (request, response) => {
  const {body} = request,
    {username, password} = body;

  const user = await User.findOne({username});
  const passwordCorrect = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  if(!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid user or password',
    });
  }

  // console.log(user);
  const userForToken = {
    id: user._id,
    username: user.username,
  };

  const token = jwt.sign(
    userForToken,
    process.env.SECRET,
    {
      expiresIn: 60 * 60 * 24 * 7,
    });

  response.send({
    name: user.name,
    username: user.username,
    token,
  });
});

module.exports = loginRouter;