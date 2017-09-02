import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import { init } from '../../src/arango';
import { arango } from '../../config.test';
import * as setup from '../setup';
import { seed, set4Users } from './utils';

init(arango);
let server;

// let tokens;
let users;
let groupKeys;

describe('REMOVE /groups/:groupKey/users/:userKey', function () {
  before(() => {
    server = app.listen();
    return set4Users()
      .then((_users) => {
        users = _users
      })
  });
  afterEach(
    setup.truncate
  );
  it('get 404 when removes users in groups', function () {
    return seed(server, users.map(user => user.token))
      .then((groups) => {
        groupKeys = groups.map(group => group._key);
        return Promise.all([
          request(server)
            .delete(`/groups/${groupKeys[0]}/users/${users[1]._key}`)
            .set('Authorization', `Bearer ${users[0].token}`)
            .expect(404),
          request(server)
            .delete(`/groups/${groupKeys[1]}/users/${users[0]._key}`)
            .set('Authorization', `Bearer ${users[3].token}`)
            .expect(404)
        ])
      })
  });

  it('deletes users from group', function () {
    return seed(server, users.map(user => user.token))
      .then((groups) => {
        groupKeys = groups.map(group => group._key);
      })
      .then(() => Promise.all([
        request(server)
          .put(`/groups/${groupKeys[0]}/users/${users[1]._key}`)
          .set('Authorization', `Bearer ${users[0].token}`)
          .expect(200),
        request(server)
          .put(`/groups/${groupKeys[1]}/users/${users[0]._key}`)
          .set('Authorization', `Bearer ${users[3].token}`)
          .expect(200)
      ]))
      .then(() => Promise.all([
        request(server)
          .delete(`/groups/${groupKeys[0]}/users/${users[1]._key}`)
          .set('Authorization', `Bearer ${users[0].token}`)
          .expect(200),
        request(server)
          .delete(`/groups/${groupKeys[1]}/users/${users[0]._key}`)
          .set('Authorization', `Bearer ${users[3].token}`)
          .expect(200)
      ]))
  })
});
