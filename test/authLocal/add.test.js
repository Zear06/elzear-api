import request from 'supertest';
import { expect } from 'chai';
import * as setup from '../setup';
import { registerLogin } from '../helpers';
import AuthFb from '../../src/schemas/AuthFacebook';
import { profile } from '../authFacebook/fbProfile';
import Auth from '../../src/schemas/Auth';

const server = setup.server;

describe('POST /auth/local/add', function () {

  before(
    setup.initDb
  );
  afterEach(
    setup.truncate
  );

  it('fails when no token', function () {
    return registerLogin()
      .then(() => request(server)
        .post('/auth/local/add')
        .expect(401)
        .then(function (res) {
          expect(res.body).to.deep.equal({ message: 'Authentication Error' });
        })
      );
  });
  it('responds 400 when adding with existing local', function () {
    return registerLogin()
      .then((token) => request(server)
        .post('/auth/local/add')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'new', password: 'pwd' })
        .expect(400)
        .then(function (res) {
          // expect(res.body).to.deep.equal({ message: 'unique constraint violated' });
        })
      );
  });

  it('adds credentials', function () {
    return AuthFb.register(profile).then(Auth.generateToken).then((user) => {
        return request(server)
          .post('/auth/local/add')
          .set('Authorization', `Bearer ${user.token}`)
          .send({ username: 'new', password: 'wen' })
          .expect('Content-Type', /json/)
          .expect(200)
          .then(function (res) {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.all.keys('token', 'user');
            expect(res.body.token).to.be.a('string');
            expect(res.body.user).to.have.all.keys('_id', '_key', '_rev', 'auths', 'createdAt', 'updatedAt', 'username');
            // expect(res.body.user.username).to.equal('new');
          })
          .then(() => Promise.all([
              request(server)
                .post('/auth/local/login')
                .send({ username: 'new', password: 'wen' })
                .expect(200)
                .then(function (res) {
                  expect(res.statusCode).to.equal(200);
                  expect(res.body).to.have.all.keys('token', 'user');
                }),
              request(server)
                .post('/auth/local/login')
                .send({ username: 'new', password: 'we' })
                .expect(401)
                .then(function (res) {
                  expect(res.statusCode).to.equal(401);
                  expect(res.body).to.deep.equal({ message: 'Invalid login' });
                }),
              request(server)
                .post('/auth/local/login')
                .send({ username: profile.displayName, password: 'wen' })
                .expect(401)
                .then(function (res) {
                  expect(res.statusCode).to.equal(401);
                  expect(res.body).to.deep.equal({ message: 'Invalid login' });
                })
            ])
          )
      }
    )
  });

});
