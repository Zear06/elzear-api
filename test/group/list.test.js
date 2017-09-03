import request from 'supertest';
import { expect } from 'chai';
import * as setup from '../setup';
import { seed } from './utils';
import { set4Users } from '../helpers';

const server = setup.server;
let users;

describe('/groups', function () {
  before(() => {
    return set4Users()
      .then((_tokens) => {
        users = _tokens;
      })
  });
  afterEach(
    setup.truncate
  );

  it('lists groups', function () {
    return seed(server, users.map(user => user.token))
      .then(() => {
        return Promise.all([
          request(server)
            .get('/groups')
            .set('Authorization', `Bearer ${users[3].token}`)
            .expect(200)
            .then(function (res) {
              expect(res.body.data).to.have.length(2);
            }),
          request(server)
            .get('/groups')
            .set('Authorization', `Bearer ${users[2].token}`)
            .expect(200)
            .then(function (res) {
              expect(res.body.data).to.have.length(1);
            }),
          request(server)
            .get('/groups')
            .set('Authorization', `Bearer ${users[0].token}`)
            .expect(200)
            .then(function (res) {
              expect(res.body.data).to.have.length(2);
            })
        ])
      })
  });
});
