import request from 'supertest';
import { expect } from 'chai';
import * as setup from '../setup';
import { seed } from './utils';
import { set4Users } from '../helpers';

const server = setup.server;
let users;
let groupKeys;

describe('GET /groups/:groupId', function () {
  before(() => {
    return set4Users()
      .then((_tokens) => {
        users = _tokens;
      })
  });
  afterEach(
    setup.truncate
  );

  it('get groups I own', function () {
    return seed(server, users.map(user => user.token))
      .then((groups) => {
        groupKeys = groups.map(group => group._key);
        return Promise.all([
          request(server)
            .get(`/groups/${groupKeys[0]}`)
            .set('Authorization', `Bearer ${users[0].token}`)
            .expect(200)
            .then(function (res) {
              expect(res.body).to.have.all.keys(
                ['_id', '_key', '_rev', 'name', 'public', 'type', 'createdAt', 'updatedAt']);
              expect(res.body.name).to.equal('Group 0')
            }),
          request(server)
            .get(`/groups/${groupKeys[1]}`)
            .set('Authorization', `Bearer ${users[3].token}`)
            .expect(200)
            .then(function (res) {
              expect(res.body).to.have.all.keys(
                ['_id', '_key', '_rev', 'name', 'public', 'type', 'createdAt', 'updatedAt']);
              expect(res.body.name).to.equal('Group 1')
            })
        ])
      })
  });
});
