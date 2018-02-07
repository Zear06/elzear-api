import Arango from 'arangojs';
import { arango } from '../../config.dev';
import { collections, edgeCollections } from '../schemas/collections';

const url = `http://${arango.username}:${arango.password}@${arango.host}:${arango.port}`;

// Promise.all([
//   users.drop(),
//   groups.drop(),
//   groups_users.drop(),
//   auth_local.drop(),
//   auth_facebook.drop(),
//   users_auths.drop()
// ])
//   .then(() => console.log('Collection dropped'));
// db.createDatabase('elzear')
//   .then(() => db.useDatabase('elzear'))
//   .then(() => Promise.all(
//     collections.map(name => db.collection(name).create())
//   ))
//   .then(() => Promise.all(
//     edgeCollections.map(name => db.edgeCollection(name).create())
//   ))
//   .then(() => console.log('Collection created'));

function initDb(dbName) {
  const db = new Arango({
    url
  });
  return db
    .dropDatabase(dbName)
    .catch(() => true) // database was already removed
    .then(() => db.createDatabase(dbName))
    .then(() => db.useDatabase(dbName))
    .then(() => Promise.all(collections.map(name => db.collection(name).create())))
    .then(() => Promise.all(edgeCollections.map(name => db.edgeCollection(name).create())))
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('Collection created');
    });
}

initDb('elzear');
