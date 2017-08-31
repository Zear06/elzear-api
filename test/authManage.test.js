import request from 'supertest';
import { expect } from 'chai';
import { init } from '../src/arango';
import { arango } from '../config.test';
import * as setup from './setup';
import { wholeUser } from './helpers';
import * as _ from 'lodash';

init(arango);

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
            expect(_.find(user.auths, { type: 'local' }).master).to.equal(true);
            expect(_.find(user.auths, { type: 'facebook' }).master).to.equal(false);
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
            expect(_.find(user.auths, { type: 'local' }).master).to.equal(true);
            expect(_.find(user.auths, { type: 'facebook' }).master).to.equal(false);
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
            expect(_.find(user.auths, { type: 'local' }).master).to.equal(false);
            expect(_.find(user.auths, { type: 'facebook' }).master).to.equal(true);
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
            expect(_.find(user.auths, { type: 'local' }).master).to.equal(false);
            expect(_.find(user.auths, { type: 'facebook' }).master).to.equal(true);
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
          .expect(200)
          .then(function (res) {
            const user = res.body;
            expect(_.some(user.auths, { type: 'local' })).to.equal(true);
            expect(_.some(user.auths, { type: 'facebook' })).to.equal(true);
          })
      });
  });
});
