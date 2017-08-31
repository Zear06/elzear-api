import request from 'supertest';
import { server } from './setup';

describe('GET /health', function () {
  it('respond with json', function () {
    request(server)
      .get('/health')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body).to.deepEqual({ dependencies: [] });
        if (err) throw err;
      });
  });
});
