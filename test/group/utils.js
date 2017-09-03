import request from 'supertest';

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


export {
  postGroup,
  seed
};
