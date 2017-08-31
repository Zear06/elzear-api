import request from 'supertest';
import { server } from './setup';
import { UserArango } from '../src/schemas/User';

const testUser = { username: 'valid', password: 'password' };

const makePayload = (auth) => ({
...testUser,
...auth
});

function register(auth) {
  return request(server)
    .post('/auth/local/register')
    .send(makePayload(auth))
    .expect('Content-Type', /json/)
    .expect(200)
}

function registerLogin(auth) {
  return register(makePayload(auth))
    .then(() => login(makePayload(auth)))
    .then(function (res) {
      return res.body.token
    });
}

function login(auth) {
  return request(server)
    .post('/auth/local/login')
    .send(makePayload(auth))
}

function add(type, payload, token) {
  return UserArango.add(type, payload, token);
}

const fbProfile = {
  id: 'idid'
};

function wholeUser(auth) {
  return registerLogin(makePayload(auth))
    .then(token => add('facebook', fbProfile, token)
      .then(() => token)
    );
}

export { registerLogin, register, login, wholeUser };
