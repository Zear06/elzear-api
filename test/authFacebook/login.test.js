import request from 'supertest';
import { expect } from 'chai';
import * as setup from '../setup';
import { server } from '../setup';
import { profile } from './fbProfile';
import AuthFb from '../../src/schemas/AuthFacebook';

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
    return AuthFb.login(profile)
      .then(() => {
        return expect(true).not.to.be.ok;
      })
      .catch((e) => {
        expect(e.message).to.equal('no match');
        return true;
      })
  });


  it('register when callback is called', function () {
    return AuthFb.register(profile)
      .then(() => AuthFb.login(profile))
      .then((user) => {
          expect(user).to.be.ok;
          expect(user).have.all.keys(['_key', '_id', '_rev', 'createdAt', 'updatedAt', 'auths', 'name', 'masterAuth']);
        }
      );
  });
});
