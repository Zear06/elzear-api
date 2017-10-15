import request from 'supertest';
import { expect } from 'chai';
import { server } from '../setup';
import * as setup from '../setup';
import { setUser } from '../seed';
import User from '../../src/schemas/Auth';

let token = null;
let user = null;
let token2 = null;
let user2 = null;

function addGroup(_token = token) {
  return request(server)
    .post('/graphql?query')
    .send({
      query: `mutation groupadd {
      groupAdd(type: "oligarchy", name: "Group Name", description: "descr") {
      _id, _key, name, description, createdAt, updatedAt, type,
      actions,
      users { _id, name },
      groupUsers {_id, _from, _to},
      iAmIn {_id, _from, _to} 
      }}
      ` })
    .set('Authorization', `Bearer ${_token}`);
}

describe('gql groups', function () {


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
      .then(() => {
        return setUser({ name: 'Timon' })
          .then(_user => {
            user2 = _user;
            return User.toJwt(_user)
          })
          .then(_token => {
            token2 = _token;
          })
      })
  });

  afterEach(
    setup.truncate
  );


  it('fails when no token', function () {
    return request(server)
      .get('/graphql?query')
      .send({ query: '{groups{_id}}' })
      // .set('Authorization', `Bearer ${token}`)
      .then(function (res) {
        expect(res.body).to.deep.equal({ data: { groups: [] } });
      })
  });

  it('adds group', function () {
    return addGroup()
      .then(function (res) {
        expect(res.body).to.have.all.keys('data');
        expect(res.body.data).to.have.all.keys('groupAdd');
        expect(res.body.data.groupAdd).to.have.all.keys('_id', '_key', 'name', 'description', 'actions',
          'createdAt', 'groupUsers', 'iAmIn', 'type', 'updatedAt', 'users');
        expect(res.body.data.groupAdd._id).to.include('groups/');
      })
  });

  it('edits group', function () {
    return addGroup()
      .then(function (res) {
        const groupKey = res.body.data.groupAdd._key;
        return request(server)
          .post('/graphql?query')
          .send({
            query: `mutation groupedit { groupEdit(
            groupKey: "${groupKey}", type: "oligarchy", name: "new name", description: "new descr",
            list: 0, read: 0, edit: 2) {
                _id, _key, name, description, list, read, edit, createdAt, updatedAt, type,
                users { _id, name },
                comments { _id, _key, text },
                groupUsers {_id, _from, _to},
                iAmIn {_id, _from, _to} }
            }`
          })
          .set('Authorization', `Bearer ${token}`)
          .then(function (res) {
            expect(res.body).to.have.all.keys('data');
            expect(res.body.data).to.have.all.keys('groupEdit');
            expect(res.body.data.groupEdit).to.have.all.keys('_id', '_key', 'name', 'description', 'list', 'read', 'edit',
              'createdAt', 'groupUsers', 'iAmIn', 'type', 'updatedAt', 'users', 'comments');
            expect(res.body.data.groupEdit._id).to.include('groups/');
            expect(res.body.data.groupEdit.name).to.equal('new name');
            expect(res.body.data.groupEdit.description).to.equal('new descr');
          })
      })
  });

  it('get groups', function () {
    return addGroup()
      .then(function (res) {
        const groupKey = res.body.data.groupAdd._key;
        return request(server)
          .post('/graphql?query')
          .send({
            query: `{groups {
              _id, _key, name, description, list, read, edit, createdAt, updatedAt, type,
                users { _id, name },
                groupUsers {_id, _from, _to},
                iAmIn {_id, _from, _to}
            }}`
          })
          .set('Authorization', `Bearer ${token}`)
          .then(function (res) {
            expect(res.body).to.have.all.keys('data');
            expect(res.body.data).to.have.all.keys('groups');
            expect(res.body.data.groups[0]._key).to.equal(groupKey);
          })
      })
  });
  it('get 1 group', function () {
    return addGroup()
      .then(function (res) {
        const groupKey = res.body.data.groupAdd._key;
        return request(server)
          .post('/graphql?query')
          .send({
            query: `{group(key: "${groupKey}") {
              _id, _key, name, description, createdAt, updatedAt, type,
                actions,
                users { _id, name },
                groupUsers {_id, _from, _to},
                iAmIn {_id, _from, _to},
                polls {_id}
            }}`
          })
          .set('Authorization', `Bearer ${token}`)
          .then(function (res) {
            expect(res.body).to.have.all.keys('data');
            expect(res.body.data).to.have.all.keys('group');
            expect(res.body.data.group._key).to.equal(groupKey);
          })
      })
  });
  it('joins group', function () {
    return addGroup()
      .then(function (res) {
        const groupKey = res.body.data.groupAdd._key;
        return request(server)
          .post('/graphql?query')
          .send({
            query: `mutation groupSelfAction {
            groupSelfAction(groupKey: "${groupKey}", action: "join") {
              _id, _key
            }
            }`
          })
          .set('Authorization', `Bearer ${token2}`)
          .then(function (res) {
            expect(res.body).to.have.all.keys('data');
            expect(res.body.data).to.have.all.keys('groupSelfAction');
          })
      })
  });
});

export default addGroup;
