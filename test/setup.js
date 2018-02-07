import { arango as config } from '../config.test';
import app from '../src/app';
import { init } from '../src/arango';
import { collections, edgeCollections } from '../src/schemas/collections'
import chai from 'chai';
chai.config.includeStack = true;

function initDb() {
  const db = init(config);
  db.useDatabase('_system');

  return db
    .useDatabase('_system')
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
  const db = init(config);
  db.useDatabase('elzear_test');
  return Promise.all(
    edgeCollections.map(name => db.edgeCollection(name).truncate())
  )
    .then(() => Promise.all(
      collections.map(name => db.collection(name).truncate())
    ))
}


init(config);

const server = app.listen();

export { initDb, truncate, server, app };
