import request from 'supertest';
import * as setup from '../setup';
import { register } from '../helpers';

const postGroup = (server, token, payload) => request(server)
  .post('/groups')
  .set('Authorization', `Bearer ${token}`)
  .send({
    type: 'oligarchy',
    public: false,
    ...payload
  })
  .expect(200)
  .then(res => res.body);

const seed = (server, tokens) => Promise.all([
  postGroup(server, tokens[0], { name: 'Group 0' }),
  postGroup(server, tokens[3], { name: 'Group 1', public: true }),
  postGroup(server, tokens[3], { name: 'Group 2' })
]);

const set4Users = () => setup.initDb()
  .then(() => Promise.all([
    register({ username: 'userA' }).then(res => res.body),
    register({ username: 'userB' }).then(res => res.body),
    register({ username: 'userC' }).then(res => res.body),
    register({ username: 'userD' }).then(res => res.body)
  ]));

export {
  set4Users,
  postGroup,
  seed
};
