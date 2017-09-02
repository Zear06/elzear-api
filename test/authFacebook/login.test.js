import request from 'supertest';
import { expect } from 'chai';
import * as setup from '../setup';
import { server } from '../setup';
import { UserArango } from '../../src/schemas/User';
import { profile } from './fbProfile';

describe('POST /auth/facebook/login', function () {

  before(
    setup.initDb
  );

  it('redirects', function () {
    return request(server)
      .get('/auth/facebook/login')
      .expect(302)
      .then(function (res) {
        expect(res.status).to.equal(302)
      });
  });

  it('fails when not registered', function () {
    return UserArango.login('facebook', profile)
      .then(() => {
        return expect(true).not.to.be.ok;
      })
      .catch((e) => {
        expect(e.message).to.equal('no match');
        return true;
      })
  });


  it('register when callback is called', function () {
    return UserArango.register('facebook', profile)
      .then(() => UserArango.login('facebook', profile))
      .then((user) => {
          expect(user).to.be.ok;
          expect(user).have.all.keys(['_key', '_id', '_rev', 'createdAt', 'updatedAt', 'auths', 'username']);
        }
      );
  });
});
