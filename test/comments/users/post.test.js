import request from 'supertest';
import { expect } from 'chai';
import * as setup from '../../setup';
import { set4Users } from '../../helpers';

const server = setup.server;
let users;

describe('POST /users/:userKey/comments', function () {
  before(() => {
    return set4Users()
      .then((_users) => {
        users = _users;
      })
  });

  afterEach(
    setup.truncate
  );

  it('posts comment', function () {
    return set4Users(server, users.map(user => user.token))
      .then(function (res) {
        return request(server)
          .post(`/users/${users[0].user._key}/comments`)
          .set('Authorization', `Bearer ${users[0].token}`)
          .send({ text: 'New Name' })
          .expect(200)
          .then(function (res) {
            expect(res.body).to.have.all.keys(['_id', '_key', '_rev']);
          });
      })
      .then(function (res) {
        return request(server)
          .get(`/users/${users[0].user._key}/comments`)
          .set('Authorization', `Bearer ${users[0].token}`)
          .expect(200)
          .then(function (res) {
            console.log('res.body', res.body);

            expect(res.body).to.have.length(1);
            expect(res.body[0]).to.have.all.keys(['_id', '_key', '_rev', '_from', '_to', 'text']);
          });
      })
  });
});
