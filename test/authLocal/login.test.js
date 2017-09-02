import request from 'supertest';
import { expect } from 'chai';
import * as setup from '../setup';

const server = setup.server;
const testUser = { username: 'valid', password: 'password' };

function register() {
  return request(server)
    .post('/auth/local/register')
    .send(testUser)
    .expect('Content-Type', /json/)
    .expect(200)
}

describe('POST /auth/local/login', function () {

  before(
    setup.initDb
  );
  afterEach(
    setup.truncate
  );

  it('responds 401 for invalid login', function () {
    return request(server)
      .post('/auth/local/login')
      .send({ username: 'invalid', password: 'more invalid' })
      .expect('Content-Type', /json/)
      .expect(401)
      .then(function (err, res) {
        expect(err.statusCode).to.equal(401);
        expect(err.body).to.deep.equal({ message: 'Invalid login' });
        expect(res).not.to.be.ok;
      });
  });

  it('works', function () {
    return register()
      .then(() => {
        return request(server)
          .post('/auth/local/login')
          .send(testUser)
          .expect(200)
          .then(function (res) {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.all.keys('token', 'user');
          });
      });
  });
  it('fails when bad password', function () {
    return register()
      .then(() => {
        return request(server)
          .post('/auth/local/login')
          .send({ username: testUser.username, password: 'wrong' })
          .expect(401)
          .then(function (res) {
            expect(res.statusCode).to.equal(401);
            expect(res.body).to.deep.equal({ message: 'Invalid login' });
          });
      });
  });
  it('fails when bad username', function () {
    return register()
      .then(() => {
        return request(server)
          .post('/auth/local/login')
          .send({ username: 'wrong', password: testUser.password })
          .expect(401)
          .then(function (res) {
            expect(res.statusCode).to.equal(401);
            expect(res.body).to.deep.equal({ message: 'Invalid login' });
          });
      });
  });
  it('fails when field missing', function () {
    return register()
      .then(() => {
        return request(server)
          .post('/auth/local/login')
          .send({ username: 'user' })
          .expect(401)
          .then(function (res) {
            expect(res.statusCode).to.equal(401);
            expect(res.body).to.deep.equal({ message: 'Invalid login' });
          });
      });
  });
});
