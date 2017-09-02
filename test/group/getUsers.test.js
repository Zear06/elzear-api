import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import { init } from '../../src/arango';
import { arango } from '../../config.test';
import * as setup from '../setup';
import { seed, set4Users } from './utils';

init(arango);
let server;

let users;
let groupKeys;

describe('GET /groups/:groupKey/users', function () {
  before(() => {
    server = app.listen();
    return set4Users()
      .then((_users) => {
        users = _users;
      })
  });
  afterEach(
    setup.truncate
  );
  it('gets users from group', function () {
    return seed(server, users.map(user => user.token))
      .then((groups) => {
        groupKeys = groups.map(group => group._key);
      })
      .then(() => Promise.all([
        request(server)
          .put(`/groups/${groupKeys[0]}/users/${users[1].user._key}`)
          .set('Authorization', `Bearer ${users[0].token}`)
          .expect(200),
        request(server)
          .put(`/groups/${groupKeys[1]}/users/${users[0].user._key}`)
          .set('Authorization', `Bearer ${users[3].token}`)
          .expect(200)
          .then(function (res) {
            console.log('res.body', res.body);
          })
      ]))
      .then(() => Promise.all([
        request(server)
          .get(`/groups/${groupKeys[0]}/users`)
          .set('Authorization', `Bearer ${users[0].token}`)
          .expect(200)
          .then(function (res) {
            expect(res.body).has.length(2);
          }),
        request(server)
          .get(`/groups/${groupKeys[1]}/users`)
          .set('Authorization', `Bearer ${users[3].token}`)
          .expect(200)
          .then(function (res) {
            expect(res.body).has.length(2);
          })
      ]))
  })
});
