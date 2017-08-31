import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import { init } from '../../src/arango';
import { arango } from '../../config.test';
import * as setup from '../setup';
import { register } from '../helpers';

init(arango);
let server;

const postGroup = (token, payload) => request(server)
  .post('/groups')
  .set('Authorization', `Bearer ${token}`)
  .send({
    type: 'oligarchy',
    public: false,
    ...payload
  })
  .expect(200);

let tokens;
const seed = () => Promise.all([
  postGroup(tokens[0], { name: 'Group 0' }),
  postGroup(tokens[3], { name: 'Group 1', public: true }),
  postGroup(tokens[3], { name: 'Group 2' })
]);

describe('/groups', function () {


  before(() => {
    server = app.listen();

    return setup.initDb()
      .then(() => Promise.all([
        register({ username: 'userA' }).then(res => res.body.token),
        register({ username: 'userB' }).then(res => res.body.token),
        register({ username: 'userC' }).then(res => res.body.token),
        register({ username: 'userD' }).then(res => res.body.token)
      ])
        .then((_tokens) => {
        tokens = _tokens;
      }))
  });
  afterEach(
    setup.truncate
  );

  it('creates group', function () {
    return seed()
      .then(function (res) {
        expect(res[0].body).to.have.all.keys('_id', '_key', '_rev', 'createdAt', 'name', 'public', 'type', 'updatedAt');
        expect(res[1].body).to.have.all.keys('_id', '_key', '_rev', 'createdAt', 'name', 'public', 'type', 'updatedAt');
        expect(res[0].body.name).to.equal('Group 0');
        expect(res[1].body.name).to.equal('Group 1');
      })

  });

  it('lists groups', function () {
    return seed()
      .then(() => {
        return Promise.all([
          request(server)
            .get('/groups')
            .set('Authorization', `Bearer ${tokens[3]}`)
            .expect(200)
            .then(function (res) {
              expect(res.body).to.have.length(2);
            }),
          request(server)
            .get('/groups')
            .set('Authorization', `Bearer ${tokens[2]}`)
            .expect(200)
            .then(function (res) {
              expect(res.body).to.have.length(1);
            }),
          request(server)
            .get('/groups')
            .set('Authorization', `Bearer ${tokens[0]}`)
            .expect(200)
            .then(function (res) {
              expect(res.body).to.have.length(2);
            })
        ])
      })
  });

  it('lists groups I belong to', function () {
    return seed()
      .then(() => {
        return Promise.all([
          request(server)
            .get('/groups/mine')
            .set('Authorization', `Bearer ${tokens[3]}`)
            .expect(200)
            .then(function (res) {
              expect(res.body).to.have.length(2);
            }),
          request(server)
            .get('/groups/mine')
            .set('Authorization', `Bearer ${tokens[2]}`)
            .expect(200)
            .then(function (res) {
              expect(res.body).to.have.length(0);
            }),
          request(server)
            .get('/groups/mine')
            .set('Authorization', `Bearer ${tokens[0]}`)
            .expect(200)
            .then(function (res) {
              expect(res.body).to.have.length(1);
            })
        ])
      })
  });
});
