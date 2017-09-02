import Arango from 'arangojs';

let db = null;

function init(config) {
  const url = `http://${config.username}:${config.password}@${config.host}:${config.port}`;
  db = new Arango({
    url,
    databaseName: config.databaseName
  });
}

function get() {
  return db;
}

export default db;
export { init, get, db };
