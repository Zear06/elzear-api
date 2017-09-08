import Arango from 'arangojs';
import { arango as config } from '../config.test';
import app from '../src/app';
import { init } from '../src/arango';
import { collections, edgeCollections } from '../src/schemas/collections'
import chai from 'chai';
chai.config.includeStack = true;

const url = `http://${config.username}:${config.password}@${config.host}:${config.port}`;

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


init(config);

const server = app.listen();

export { initDb, truncate, server, app };
