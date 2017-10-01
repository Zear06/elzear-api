import request from 'supertest';
import { expect } from 'chai';
import { server } from '../setup';
import * as setup from '../setup';
import { setUser } from '../seed';
import User from '../../src/schemas/Auth';

let token = null;
let user = null;

function addGroup() {
  return request(server)
    .post('/graphql?query')
    .send({
      query: `mutation groupadd {
      groupAdd(type: "oligarchy", name: "name", description: "descr") {
      _id, _key, name, description, createdAt, updatedAt, type,
      actions,
      users { _id, name },
      groupUsers {_id, _from, _to},
      iAmIn {_id, _from, _to} 
      }}
      ` })
    .set('Authorization', `Bearer ${token}`);
}

describe('gql comments', function () {


  before(() => {
    return setup.initDb();
  });

  beforeEach(() => {
    return setUser({ name: 'Pumba' })
      .then(_user => {
        user = _user;
        return User.toJwt(_user)
      })
      .then(_token => {
        token = _token;
      })
  });

  afterEach(
    setup.truncate
  );

  it('post comment', function () {
    return addGroup()
      .then(function (res) {
        const groupKey = res.body.data.groupAdd._key;
        return request(server)
          .post('/graphql?query')
          .send({
            query: `mutation commentAdd {
            commentAdd(targetId: "groups/${groupKey}", text: "comment text") {
                _id, _key, text,
                author { _id }
            }
            }`
          })
          .set('Authorization', `Bearer ${token}`)
          .then(function (res) {
            expect(res.body).to.have.all.keys('data');
            expect(res.body.data).to.have.all.keys('commentAdd');
            expect(res.body.data.commentAdd).to.have.all.keys('_id', '_key', 'text', 'author');
            expect(res.body.data.commentAdd._id).to.include('comments/');
          })
      })
  });
});
