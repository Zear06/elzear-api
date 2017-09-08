import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app';
import * as setup from './setup';

let server;

const testUser = { username: 'valid', password: 'password' };

function register() {
  return request(server)
    .post('/auth/local/register')
    .send(testUser)
    .expect('Content-Type', /json/)
    .expect(200)
}

function login() {
  return register()
    .then(() => {
      return request(server)
        .post('/auth/local/login')
        .send(testUser)
        .expect(200)
        .then(function (res) {
          return res.body.token
        });
    })
}

describe('GET /me', function () {

  before(() => {
    server = app.listen();
    return setup.initDb();
  });
  afterEach(
    setup.truncate
  );

  it('fails when no token', function () {
    return login()
      .then(token => {
        return request(server)
          .get('/me')
          .expect(401)
          .then(function (res) {
            expect(res.body).to.deep.equal({ message: 'Authentication Error' });
          })
      });
  });

  it('works', function () {
    return login()
      .then(token => {
        return request(server)
          .get('/me')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .then(function (res) {
            expect(res.body).to.have.all.keys(
              '_id', '_key', '_rev', 'auths', 'createdAt', 'updatedAt', 'name', 'masterAuth');
          })
      });
  });
});
