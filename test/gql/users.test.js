import request from 'supertest';
import { expect } from 'chai';
import { server } from '../setup';
import * as setup from '../setup';
import { seed, setUser } from '../seed';
import User from '../../src/schemas/Auth';

describe('gql users', function () {

  let token = null;
  let user = null;

  before(() => {
    return setup.initDb();
  });

  beforeEach(() => {
    return setUser({ name: 'Pumba' })
      .then(_user => {
        user = _user.new;
        return User.toJwt(_user.new)
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
      .send({ query: '{users{_id}}' })
      // .set('Authorization', `Bearer ${token}`)
      .then(function (res) {
        expect(res.body.errors).to.have.length(1);
        expect(res.body.errors[0].message).to.equal('Unauthorized');
      })
  });

  it('gets users', function () {
    return request(server)
      .get('/graphql?query')
      .send({
        query: `{
      users{
      _id
      groups { _id }
      auths { _id }
      }}
      `
      })
      .set('Authorization', `Bearer ${token}`)
      .then(function (res) {
        expect(res.body).to.deep.equal({ data: { users: [{ _id: user._id, groups: [] , auths: [] }] } });
      })
  });

  it('edits user', function () {

    return Promise.all([
      seed('auth_local', {
        username: 'username',
        passwordHash: 'passwordHash',
        _key: user._key
      }),
      seed('auth_facebook', {
        id: '1232',
        _key: user._key
      })
    ])
      .then(() => {
        return request(server)
          .post('/graphql?query')
          .send({
            query: `mutation userEdit {
      userEdit(
        payload: "{\\\"name\\\": \\\"new name\\\",\\\"masterAuth\\\": \\\"local\\\"}") {
      _id, masterAuth, name
      }
      }
      `
          })
          .set('Authorization', `Bearer ${token}`)
          .then(function (res) {
            expect(res.body).to.deep.equal({
              data: {
                userEdit: {
                  _id: user._id,
                  masterAuth: 'local',
                  name: 'username'
                }
              }
            })
          });
      })


  });
});