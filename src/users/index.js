import db from '../arango';

function getAll() {
  return db.collection('users').all()
    .then(users => ({
        data: users._result
      }));
}

export { getAll };
