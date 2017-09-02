import request from 'supertest';
import { server } from './setup';
import AuthFb from '../src/schemas/AuthFacebook';

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

const fbProfile = {
  id: 'idid'
};

function wholeUser(auth) {
  return registerLogin(makePayload(auth))
    .then(token => AuthFb.add(fbProfile, token)
      .then(() => token)
    );
}

export { registerLogin, register, login, wholeUser };
