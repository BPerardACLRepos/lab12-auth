require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    test('returns todos', async () => {

      const expectation = [
        {
          id: 1,
          todo: `Start Fire`,
          completed: true,
          user_id: 1,
        },
        {
          id: 2,
          todo: `Extinguish Fire`,
          completed: false,
          user_id: 1,
        },
      ];

      const data = await fakeRequest(app)
        .get('/todos')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('posts new todo from auth user enpoint', async () => {

      const newTodo = {
        todo: `Dance like nobody is watching`,
        completed: false,
      };

      const expectation = [
        {
          ...newTodo,
          id: 3,
          user_id: 2,
        }];

      const data = await fakeRequest(app)
        .post('/api/todos')
        .send(newTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('updates todo from auth user enpoint', async () => {

      const updatedTodo = {
        todo: `Dance like nobody is watching`,
        completed: true,
      };

      const expectation = [
        {
          ...updatedTodo,
          id: 3,
          user_id: 2,
        }];

      const data = await fakeRequest(app)
        .put('/api/todos/3')
        .send(updatedTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns todo from auth user enpoint', async () => {

      const onlyTodo = {
        todo: `Dance like nobody is watching`,
        completed: true,
      };

      const expectation = [
        {
          ...onlyTodo,
          id: 3,
          user_id: 2,
        }];

      const data = await fakeRequest(app)
        .get('/api/todos/')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('deletes todo from auth user enpoint', async () => {

      const deletedTodo = {
        todo: `Dance like nobody is watching`,
        completed: true,
      };

      const expectation = [
        {
          ...deletedTodo,
          id: 3,
          user_id: 2,
        }];

      const dataDelete = await fakeRequest(app)
        .delete('/api/todos/3')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(dataDelete.body).toEqual(expectation);

      const expectationBlank = [];

      const data = await fakeRequest(app)
        .get('/api/todos/')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectationBlank);
    });
  });
});
