import request from 'supertest';
import { expect } from 'chai';
import * as setup from './setup';
import { wholeUser } from './helpers';
import * as _ from 'lodash';

const server = setup.server;

describe('PATCH /auth/:type', function () {

  beforeEach(
    setup.initDb
  );

  afterEach(
    setup.truncate
  );

  it('throws with invalid types', function () {
    return wholeUser()
      .then((token) => {
        return request(server)
          .put('/auth/skyblog')
          .set('Authorization', `Bearer ${token}`)
          .expect(400)
      })
  });

  it('sets master', function () {
    return wholeUser()
      .then((token) => {
        return request(server)
          .put('/auth/local')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .then(function (res) {
            const user = res.body;
            expect(user.auths).to.have.length(2);
            expect(user.masterAuth).to.equal('local');
            expect(_.find(user.auths, { type: 'local' })).to.be.ok;
            expect(_.find(user.auths, { type: 'facebook' })).to.be.ok;
            return token;
          })
      })
      .then((token) => {
        return request(server)
          .put('/auth/local')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .then(function (res) {
            const user = res.body;
            expect(user.auths).to.have.length(2);
            expect(user.masterAuth).to.equal('local');
            return token;
          })
      })
      .then((token) => {
        return request(server)
          .put('/auth/facebook')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .then(function (res) {
            const user = res.body;
            expect(user.auths).to.have.length(2);
            expect(user.masterAuth).to.equal('facebook');
            return token;
          })
      })
  });

  it('deletes facebook auth', function () {
    return wholeUser()
      .then((token) => {
        return request(server)
          .delete('/auth/facebook')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .then(function (res) {
            const user = res.body;
            expect(_.some(user.auths, { type: 'local' })).to.equal(true);
            expect(_.some(user.auths, { type: 'facebook' })).to.equal(false);
          })
      });
  });

  it('deletes local auth', function () {
    return wholeUser()
      .then((token) => {
        return request(server)
          .put('/auth/facebook')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .then(function (res) {
            const user = res.body;
            expect(user.auths).to.have.length(2);
            expect(user.masterAuth).to.equal('facebook');
            return token;
          })
      })
      .then((token) => {
        return request(server)
          .delete('/auth/local')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .then(function (res) {
            const user = res.body;
            expect(_.some(user.auths, { type: 'facebook' })).to.equal(true);
            expect(_.some(user.auths, { type: 'local' })).to.equal(false);
          })
      });
  });

  it('fails to delete master auth', function () {
    return wholeUser()
      .then((token) => {
        return request(server)
          .delete('/auth/local')
          .set('Authorization', `Bearer ${token}`)
          .expect(400)
          .then(function (res) {
            // const user = res.body;
            // expect(_.some(user.auths, { type: 'local' })).to.equal(true);
            // expect(_.some(user.auths, { type: 'facebook' })).to.equal(true);
          })
      });
  });
});
