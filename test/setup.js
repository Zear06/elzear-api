import Arango from 'arangojs';
import { arango as config } from '../config.test';
import app from '../src/app';

const url = `http://${config.username}:${config.password}@${config.host}:${config.port}`;

const collections = ['users', 'groups', 'auth_local', 'auth_facebook'];
const edgeCollections = ['groups_users', 'users_auths'];

function initDb() {
  const db = new Arango({
    url
  });
  return db
    .dropDatabase('elzear_test')
    .catch(() => true) // database was already removed
    .then(() => db.createDatabase('elzear_test'))
    .then(() => db.useDatabase('elzear_test'))
    .then(() => Promise.all(
      collections.map(name => db.collection(name).create())
    ))
    .then(() => Promise.all(
      edgeCollections.map(name => db.edgeCollection(name).create())
    ))
    .then(() => {
      console.log('Collection created');
    });
}

function truncate() {
  const db = new Arango({
    url
  });
  db.useDatabase('elzear_test');
  return Promise.all(
    edgeCollections.map(name => db.edgeCollection(name).truncate())
  )
    .then(() => Promise.all(
      collections.map(name => db.collection(name).truncate())
    ))
}

const server = app.listen();

export { initDb, truncate, server, app };
