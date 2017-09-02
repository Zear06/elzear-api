import request from 'supertest';
import { expect } from 'chai';
import { initDb, server } from '../setup';

const testUser = { username: 'valid', password: 'password' };
const testUserDupe = { username: 'Dupe', password: 'dupdupdup' };


describe('POST /auth/local/register', function () {

  before(
    initDb
  );

  it('responds 401 for invalid register', function () {
    return request(server)
      .post('/auth/local/register')
      .send({ username: 'invalid' })
      .expect('Content-Type', /json/)
      .expect(400)
      .then(function (err, res) {
        expect(err.statusCode).to.equal(400);
        expect(err.body).to.deep.equal({ message: 'Missing fields' });
        expect(res).not.to.be.ok;
      });
  });

  it('works', function () {
    return request(server)
      .post('/auth/local/register')
      .send(testUser)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(function (res) {
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.have.all.keys('token', 'user');
        expect(res.body.token).to.be.a('string');
        expect(res.body.user).to.have.all.keys('_id', '_key', '_rev', 'auths', 'createdAt', 'updatedAt', 'username');
      });
  });

  it('fails on dupe', function () {
    return request(server)
      .post('/auth/local/register')
      .send(testUserDupe)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(function () {
        return request(server)
          .post('/auth/local/register')
          .send(testUserDupe)
          .expect('Content-Type', /json/)
          .expect(400)
          .then(function (res) {
            expect(res.body).to.deep.equal({ message: 'Username already in use' });
          });
      });
  });
});
