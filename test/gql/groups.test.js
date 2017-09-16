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
    .send({ query: 'mutation groupadd ' +
    '{groupAdd(type: "oligarchy", name: "name", description: "descr", list: 0, read: 0, edit: 2) ' +
    '{ _id, _key, name, description, list, read, edit, createdAt, updatedAt, ' +
    'users { _id, name }, groupUsers {_id, _from, _to}, type, iAmIn {_id, _from, _to} }}' })
    .set('Authorization', `Bearer ${token}`);
}

describe.only('POST /auth/facebook/add', function () {


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
        expect(res.body.data.groupAdd).to.have.all.keys('_id', '_key', 'name', 'description', 'list', 'read', 'edit',
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
          .send({ query: `mutation groupedit { groupEdit(
            groupKey: "${groupKey}", type: "oligarchy", name: "new name", description: "new descr",
            list: 0, read: 0, edit: 2) {
                _id, _key, name, description, list, read, edit, createdAt, updatedAt, type,
                users { _id, name },
                groupUsers {_id, _from, _to},
                iAmIn {_id, _from, _to} }
            }` })
          .set('Authorization', `Bearer ${token}`)
          .then(function (res) {
            expect(res.body).to.have.all.keys('data');
            expect(res.body.data).to.have.all.keys('groupEdit');
            expect(res.body.data.groupEdit).to.have.all.keys('_id', '_key', 'name', 'description', 'list', 'read', 'edit',
              'createdAt', 'groupUsers', 'iAmIn', 'type', 'updatedAt', 'users');
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
          .send({ query: `{groups {
              _id, _key, name, description, list, read, edit, createdAt, updatedAt, type,
                users { _id, name },
                groupUsers {_id, _from, _to},
                iAmIn {_id, _from, _to}
            }}` })
          .set('Authorization', `Bearer ${token}`)
          .then(function (res) {
            console.log('(res.body', (res.body));
            expect(res.body).to.have.all.keys('data');
            expect(res.body.data).to.have.all.keys('groups');
            expect(res.body.data.groups[0]._key).to.equal(groupKey);
          })
      })
  });
});
