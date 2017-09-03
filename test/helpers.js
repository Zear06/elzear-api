import request from 'supertest';
import { server } from './setup';
import AuthFb from '../src/schemas/AuthFacebook';
import * as setup from './setup';

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


const set4Users = () => setup.initDb()
  .then(() => Promise.all([
    register({ username: 'userA' }).then(res => res.body),
    register({ username: 'userB' }).then(res => res.body),
    register({ username: 'userC' }).then(res => res.body),
    register({ username: 'userD' }).then(res => res.body)
  ]));

export { registerLogin, register, login, wholeUser, set4Users };
