import request from 'supertest';
import { expect } from 'chai';
import * as setup from './../setup';
import { set4Users } from '../helpers';

const server = setup.server;
let users;

describe('GET /users', function () {
  before(() => {
    return set4Users()
      .then((_users) => {
        users = _users;
      })
  });

  afterEach(
    setup.truncate
  );

  it('gets users', function () {
    return set4Users(server, users.map(user => user.token))
      .then(function (res) {
        return request(server)
          .get(`/users`)
          .set('Authorization', `Bearer ${users[0].token}`)
          .send({ text: 'New Name' })
          .expect(200)
          .then(function (res) {
            expect(res.body).to.have.all.keys(['data']);
            expect(res.body.data).to.have.length(4);
            expect(res.body.data[2]).to.have.all.keys(
              ['_key', '_id', '_rev', 'extra', 'createdAt', 'updatedAt', 'name', 'masterAuth']);
          });
      })
  });
});
