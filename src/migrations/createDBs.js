import Arango from 'arangojs';
import { arango } from '../../config.dev';

const url = `http://${arango.username}:${arango.password}@${arango.host}:${arango.port}`;
const db = Arango({
  url
});


const collections = ['users', 'groups', 'auth_local', 'auth_facebook'];
const edgeCollections = ['groups_users', 'users_auths'];

// Promise.all([
//   users.drop(),
//   groups.drop(),
//   groups_users.drop(),
//   auth_local.drop(),
//   auth_facebook.drop(),
//   users_auths.drop()
// ])
//   .then(() => console.log('Collection dropped'));
db.createDatabase('elzear')
  .then(() => db.useDatabase('elzear'))
  .then(() => Promise.all(
    collections.map(name => db.collection(name).create())
  ))
  .then(() => Promise.all(
    edgeCollections.map(name => db.edgeCollection(name).create())
  ))
  .then(() => console.log('Collection created'));
