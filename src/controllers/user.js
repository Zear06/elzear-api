import User from '../schemas/User';
import { apiArray } from './util';

function getAll(ctx, next) {
  return User.all().then(apiArray);
}

export {
  getAll
}
