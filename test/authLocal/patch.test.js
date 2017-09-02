import request from 'supertest';
import { expect } from 'chai';
import * as setup from '../setup';
import { login, registerLogin } from '../helpers';

const newAuth = { username: 'New Name', password: 'New Password' };
const oldAuth = { username: 'Old Name', password: 'Old Password' };
const server = setup.server;

describe('PATCH /auth/local', function () {

  before(
    setup.initDb
  );

  afterEach(
    setup.truncate
  );

  it('fails when no token', function () {
    return registerLogin()
      .then(() => {
        return request(server)
          .patch('/auth/local')
          .expect(401)
          .then(function (res) {
            expect(res.body).to.deep.equal({ message: 'Authentication Error' });
          })
      });
  });

  it('works', function () {
    return registerLogin(oldAuth)
      .then(token => {
        return request(server)
          .patch('/auth/local')
          .set('Authorization', `Bearer ${token}`)
          .send(newAuth)
          .expect(200)
          .then(function (res) {
            expect(res.body).to.have.all.keys('token', 'user');
            expect(res.body.user).to.have.all.keys('_id', '_key', '_rev', 'auths', 'createdAt', 'updatedAt', 'username');
            expect(res.body.user.username).to.equal(oldAuth.username);
          })
      });
  });
  it('disables old login', function () {
    return registerLogin(oldAuth)
      .then(token => {
        return request(server)
          .patch('/auth/local')
          .set('Authorization', `Bearer ${token}`)
          .send(newAuth)
          .expect(200)
          .then(function () {
            return login(oldAuth)
              .expect(401)
              .then(function (res) {
                expect(res.body).to.deep.equal({ message: 'Invalid login' });
              });
          })
      });
  });

  it('enables new login', function () {
    return registerLogin(oldAuth)
      .then(token => {
        return request(server)
          .patch('/auth/local')
          .set('Authorization', `Bearer ${token}`)
          .send(newAuth)
          .expect(200)
          .then(function () {
            return login(newAuth)
              .expect(200)
              .then(function (res) {
                expect(res.body).to.have.all.keys('token', 'user');
              });
          })
      });
  });
});
