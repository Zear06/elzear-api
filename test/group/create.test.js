import { expect } from 'chai';
import * as setup from '../setup';
import { seed } from './utils';
import { set4Users } from '../helpers';

const server = setup.server;
let users;

describe('/groups', function () {
  before(() => {
    return set4Users()
      .then((_tokens) => {
        users = _tokens;
      })
  });

  afterEach(
    setup.truncate
  );

  it('creates group', function () {
    return seed(server, users.map(user => user.token))
      .then(function (res) {
        expect(res[0]).to.have.all.keys('_id', '_key', '_rev', 'createdAt', 'name', 'public', 'type', 'updatedAt');
        expect(res[1]).to.have.all.keys('_id', '_key', '_rev', 'createdAt', 'name', 'public', 'type', 'updatedAt');
        expect(res[0].name).to.equal('Group 0');
        expect(res[1].name).to.equal('Group 1');
      })

  });
});
