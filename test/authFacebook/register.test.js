import request from 'supertest';
import { expect } from 'chai';
import * as setup from '../setup';
import { UserArango } from '../../src/schemas/User';
import { profile } from './fbProfile';

const server = setup.server;

describe('POST /auth/facebook/register', function () {

  before(
    setup.initDb
  );

  it('redirects', function () {
    return request(server)
      .get('/auth/facebook/register')
      .expect(302)
      .then(function (res) {
        expect(res.status).to.equal(302);
        return true;
      });
  });

  it('register when callback is called', function () {
    return UserArango.register('facebook', profile)
      .then((user) => {
          expect(user).to.be.ok;
          expect(user).have.all.keys(['_key', '_id', '_rev', 'createdAt', 'updatedAt', 'auths', 'username']);
          return true;
        }
      );
  });
});
