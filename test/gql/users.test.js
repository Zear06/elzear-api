import request from 'supertest';
import { expect } from 'chai';
import { server } from '../setup';
import * as setup from '../setup';
import { setUser } from '../seed';
import User from '../../src/schemas/Auth';

describe('POST /auth/facebook/add', function () {

  let token = null;
  let user = null;

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
      .send({ query: '{users{_id}}' })
      .set('Authorization', `Bearer ${token}`)
      .then(function (res) {
        expect(res.body).to.deep.equal({ data: { users: [{ _id: user._id }] } });
      })
  });
});