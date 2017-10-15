import { getDb } from '../src/arango';

function seed(collectionName: string, payload: { [string]: any }): {} {
  return getDb().collection(collectionName).save(payload, { returnNew: true });
}

function setUser(payload: { [string]: any }) {
  return seed('users', payload);
}

export {
  seed,
  setUser
};
