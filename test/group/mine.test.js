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

describe('/groups', function () {
  before(() => {
    server = app.listen();

    return set4Users()
      .then((_tokens) => {
        users = _tokens;
      });
  });
  afterEach(
    setup.truncate
  );

  it('lists groups I belong to', function () {
    return seed(server, users.map(user => user.token))
      .then(() => {
        return Promise.all([
          request(server)
            .get('/groups/mine')
            .set('Authorization', `Bearer ${users[3].token}`)
            .expect(200)
            .then(function (res) {
              expect(res.body).to.have.length(2);
            }),
          request(server)
            .get('/groups/mine')
            .set('Authorization', `Bearer ${users[2].token}`)
            .expect(200)
            .then(function (res) {
              expect(res.body).to.have.length(0);
            }),
          request(server)
            .get('/groups/mine')
            .set('Authorization', `Bearer ${users[0].token}`)
            .expect(200)
            .then(function (res) {
              expect(res.body).to.have.length(1);
            })
        ])
      })
  });
});
