const bcrypt = require('bcrypt');
const User = require('../models/User');
const mongoose = require('mongoose');
const {server} = require('../index');
const {api, getUsers} = require('./helpers');

// jest.setTimeout(60000);
describe('Users test', () => {
  beforeEach(async () =>{
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('pwd', 10);
    const user = new User({
      username: 'root',
      name: 'Agustín',
      passwordHash,
    });

    await user.save();
  });

  afterAll(async () => {
    server.close();
    mongoose.disconnect();
  });

  describe('Create a new user', () => {
    it('Should work as expected creating a fresh username', async() => {
      const usersAtStart = await getUsers();

      const newUser = {
        username: 'testUser',
        name: 'testing',
        password: '123as',
      };

      await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const usersAtEnd = await getUsers();
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

      const usernames = usersAtEnd.map((user) => user.username);
      expect(usernames).toContain('testUser');
    });

    it('Should fail creating user if username already exists', async () => {
      const usersAtStart = await getUsers();

      const user = {
        username: 'root',
        name: 'Agustín',
        password: '1234ab',
      };

      const result = await api
        .post('/api/users')
        .send(user)
        .expect(400)
        .expect('Content-Type', /application\/json/);

      const {message} = result.body.errors.username || '';
      expect(message).toContain('`username` to be unique');

      const usersAtEnd = await getUsers();
      expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });
  });
});