import request from 'supertest';
import { expect } from 'chai';
import { server } from '../setup';
import * as setup from '../setup';
import { setUser } from '../seed';
import User from '../../src/schemas/Auth';
import addGroup from './groups.test';

let token = null;
let user = null;

// function addPoll() {
//   return request(server)
//     .post('/graphql?query')
//     .send({
//       query: 'mutation pollAdd ' +
//       '{pollAdd(type: "majority", name: "name", description: "descr") ' +
//       '{ _id _key name description _from _to type }}'
//     })
//     .set('Authorization', `Bearer ${token}`);
// }

function addPoll(groupKey) {
  const mutationName = groupKey ? 'pollAddOnGroup' : 'pollAdd';
  return request(server)
    .post('/graphql?query')
    .send({
      query: `mutation ${mutationName} {
        ${mutationName}(
          type: "majority",
          name: "name",
          description: "descr"
          ${groupKey ? `, groupKey: "${groupKey}"` : ''})
          { _id _key name description _from _to type
          group { _id _key name } }
          }`
    })
    .set('Authorization', `Bearer ${token}`);
}

describe('gql polls', function () {


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
      .send({ query: '{polls{_id}}' })
      // .set('Authorization', `Bearer ${token}`)
      .then(function (res) {
        expect(res.body).to.deep.equal({ data: { polls: [] } });
      })
  });

  it('adds poll', function () {
    return addPoll()
      .then(function (res) {
        expect(res.body).to.have.all.keys('data');
        expect(res.body.data).to.have.all.keys('pollAdd');
        expect(res.body.data.pollAdd).to.have.all.keys(
          '_id', '_key', 'name', 'description', '_from', '_to', 'type', 'group');
        expect(res.body.data.pollAdd._to).to.include('groups/');
        expect(res.body.data.pollAdd._from).to.equal(user._id);
      })
  });
  it('adds poll on Group', function () {
    return addGroup(token)
      .then(function (res) {
        const groupKey = res.body.data.groupAdd._key;
        return addPoll(groupKey)
          .then(function (res) {
            expect(res.body).to.have.all.keys('data');
            expect(res.body.data).to.have.all.keys('pollAddOnGroup');
            const poll = res.body.data.pollAddOnGroup;
            expect(poll).to.have.all.keys(
              '_id', '_key', 'name', 'description', '_from', '_to', 'type', 'group');
            expect(poll._to).to.include('groups/');
            expect(poll._from).to.equal(user._id);
            expect(poll.group).to.have.all.keys('_id', '_key', 'name');
            expect(poll.group.name).to.equal('Group Name');
          })
      })
  });
  it('gets poll', function () {
    return addPoll()
      .then(function (res) {
        return request(server)
          .post('/graphql?query')
          .send({
            query: `{polls {
              _id, _key, name, description, createdAt, updatedAt, type,
              preferences { _id }
            }}`
          })
          .set('Authorization', `Bearer ${token}`)
          .then(function (res) {
            expect(res.body).to.have.all.keys('data');
            expect(res.body.data).to.have.all.keys('polls');
            expect(res.body.data.polls[0].preferences).to.deep.equal([]);
          });
      })
  });
  it('posts prefs', function () {
    return addPoll()
      .then(function (res) {
        const pollKey = res.body.data.pollAdd._key;
        return request(server)
          .post('/graphql?query')
          .send({
            query: `mutation prefAdd {prefAdd(pollKey: "${pollKey}", ranking: "[{\\\"id\\\": \\\"id\\\", \\\"name\\\": \\\"name\\\"}]")}`
          })
          .set('Authorization', `Bearer ${token}`)
      })
      .then(function (res) {
        return request(server)
          .post('/graphql?query')
          .send({
            query: `{polls {
              _id, _key, name, description, createdAt, updatedAt, type
              preferences { _id, ranking  }
            }}`
          })
          .set('Authorization', `Bearer ${token}`)
          .then(function (res) {
            expect(res.body).to.have.all.keys('data');
            expect(res.body.data).to.have.all.keys('polls');
            expect(res.body.data.polls[0].preferences[0].ranking).to.equal('[{"id":"id","name":"name"}]');
          });
      })
  });
});
