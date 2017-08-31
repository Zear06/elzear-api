import request from 'supertest';
import { server } from './setup';
import { UserArango } from '../src/schemas/User';

const testUser = { username: 'valid', password: 'password' };

function register(auth) {
  const payload = auth || testUser;
  return request(server)
    .post('/auth/local/register')
    .send(payload)
    .expect('Content-Type', /json/)
    .expect(200)
}

function registerLogin(auth) {
  const payload = auth || testUser;
  return register(payload)
    .then(() => login(payload))
    .then(function (res) {
      return res.body.token
    });
}

function login(auth) {
  const payload = auth || testUser;
  return request(server)
    .post('/auth/local/login')
    .send(payload)
}

function add(type, payload, token) {
  return UserArango.add(type, payload, token);
}

const fbProfile = {
  id: 'idid'
};

function wholeUser(auth) {
  const payload = auth || testUser;
  return registerLogin(payload)
    .then(token => add('facebook', fbProfile, token)
      .then(() => token)
    );
}

export { registerLogin, register, login, wholeUser };
