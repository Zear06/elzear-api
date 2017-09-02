import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import * as setup from '../setup';
import { seed, set4Users } from './utils';

const server = setup.server;
let users;
let groupKeys;

describe('PATCH /groups/:groupKey/users/:userKey', function () {
  before(() => {
    return set4Users()
      .then((_users) => {
        users = _users;
      })
  });
  afterEach(
    setup.truncate
  );
  it('patchs users from group', function () {
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
      ]))
      .then(() => Promise.all([
        request(server)
          .patch(`/groups/${groupKeys[0]}/users/${users[1].user._key}`)
          .set('Authorization', `Bearer ${users[0].token}`)
          .send({ role: 'Bully' })
          .expect(200)
          .then(function (res) {
            expect(res.body.role).to.equal('Bully');
          }),
        request(server)
          .patch(`/groups/${groupKeys[1]}/users/${users[0].user._key}`)
          .set('Authorization', `Bearer ${users[3].token}`)
          .send({ role: 'Submaster' })
          .expect(200)
          .then(function (res) {
            expect(res.body.role).to.equal('Submaster');
          })
      ]))
  })
});
