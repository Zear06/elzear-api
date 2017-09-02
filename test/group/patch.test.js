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

describe('PATCH /groups/:groupId', function () {
  before(() => {
    server = app.listen();

    return set4Users()
      .then((_tokens) => {
        users = _tokens;
      })
  });
  afterEach(
    setup.truncate
  );

  it('patches groups I own', function () {
    return seed(server, users.map(user => user.token))
      .then((groups) => {
        groupKeys = groups.map(group => group._key);
        return Promise.all([
          request(server)
            .patch(`/groups/${groupKeys[0]}`)
            .set('Authorization', `Bearer ${users[0].token}`)
            .send({name: 'New Name'})
            .expect(200)
            .then(function (res) {
              expect(res.body).to.have.all.keys(
                ['_id', '_key', '_rev', 'name', 'public', 'type', 'createdAt', 'updatedAt']);
              expect(res.body.name).to.equal('New Name')
            }),
          request(server)
            .patch(`/groups/${groupKeys[1]}`)
            .set('Authorization', `Bearer ${users[3].token}`)
            .send({name: 'New Name 2'})
            .expect(200)
            .then(function (res) {
              expect(res.body).to.have.all.keys(
                ['_id', '_key', '_rev', 'name', 'public', 'type', 'createdAt', 'updatedAt']);
              expect(res.body.name).to.equal('New Name 2')
            })
        ])
      })
  });
});
