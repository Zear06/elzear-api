import request from 'supertest';
import { expect } from 'chai';
import { init } from '../../src/arango';
import { arango } from '../../config.test';
import * as setup from '../setup';
import { registerLogin } from '../helpers';
import { server } from '../setup';

init(arango);

describe('POST /auth/facebook/add', function () {

  before(() => {
    return setup.initDb();
  });

  afterEach(
    setup.truncate
  );

  it('redirects', function () {
    return registerLogin()
      .then((token) => request(server)
        .get(`/auth/facebook/add?token=${token}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(302)
        .then(function (res) {
          expect(res.status).to.equal(302)
        })
      );
  });


  it('fails 1', function () {
    return registerLogin()
      .then((token) => request(server)
        .get('/auth/facebook/add')
        .set('Authorization', `Bearer ${token}`)
        .expect(401)
        .then(function (res) {
          expect(res.status).to.equal(401)
        })
      );
  });
  it('fails when no token', function () {
    return registerLogin()
      .then(() => request(server)
        .get('/auth/facebook/add')
        .expect(401)
        .then(function (res) {
          expect(res.body).to.deep.equal({ message: 'jwt must be provided' });
        })
      );
  });
});
