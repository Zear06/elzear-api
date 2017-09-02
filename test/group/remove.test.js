import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import { init } from '../../src/arango';
import { arango } from '../../config.test';
import * as setup from '../setup';
import { seed, set4Users } from './utils';

init(arango);
let server;
let groupKeys;
let users;

describe('DELETE /groups/:groupId', function () {
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

  it('deletes groups I own', function () {
    return seed(server, users.map(user => user.token))
      .then((groups) => {
        groupKeys = groups.map(group => group._key);
        return Promise.all([
          request(server)
            .delete(`/groups/${groupKeys[0]}`)
            .set('Authorization', `Bearer ${users[0].token}`)
            .expect(200)
            .then(function (res) {
              expect(res.body).to.have.all.keys(['removed', 'ignored', 'error', 'code']);
              expect(res.body.removed).to.equal(1);
            }),
          request(server)
            .delete(`/groups/${groupKeys[1]}`)
            .set('Authorization', `Bearer ${users[3].token}`)
            .expect(200)
            .then(function (res) {
              expect(res.body).to.have.all.keys(['removed', 'ignored', 'error', 'code']);
              expect(res.body.removed).to.equal(1);
            })
        ])
      })
  });
});
