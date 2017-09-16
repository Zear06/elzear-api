import { db } from '../src/arango';

function seed(collectionName, payload) {
  return db.collection(collectionName).save(payload, { returnNew: true });
}

function setUser(payload) {
  return seed('users', payload);
}

export {
  seed,
  setUser
};
