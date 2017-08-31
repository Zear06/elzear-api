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

describe.only('POST /groups', function () {

  let tokens;

  before(() => {
    server = app.listen();

    return setup.initDb()
      .then(() => Promise.all([
        register({ username: 'userA' }).then(res => res.body.token),
        register({ username: 'userB' }).then(res => res.body.token),
        register({ username: 'userC' }).then(res => res.body.token),
        register({ username: 'userD' }).then(res => res.body.token)
      ]).then((_tokens) => {
        tokens = _tokens;
      }))
  });
  afterEach(
    setup.truncate
  );

  it('creates group', function () {
    console.log('tokens', tokens);
    console.log('tokens[3]', tokens[3]);

    return Promise.all([
      postGroup(tokens[0], { name: 'Group 0' }),
      postGroup(tokens[3], { name: 'Group 1', public: true }),
      postGroup(tokens[3], { name: 'Group 2' })
    ])
      .then(function (res) {
        console.log('res[0].body', res[0].body);

        expect(res[0].body).to.have.all.keys('_id', '_key', '_rev', 'createdAt', 'name', 'public', 'type', 'updatedAt');
        expect(res[1].body).to.have.all.keys('_id', '_key', '_rev', 'createdAt', 'name', 'public', 'type', 'updatedAt');
        expect(res[0].body.name).to.equal('Group 0');
        expect(res[1].body.name).to.equal('Group 1');
      })
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
});
