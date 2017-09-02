import User from '../schemas/User';

function getAll(ctx, next) {
  return User.all();
}

export {
  getAll
}
