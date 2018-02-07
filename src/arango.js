import Arango from 'arangojs';

type Db = {
  collection: (string) => any,
  edgeCollection: (string) => any,
  query: (string) => Promise<any>
};

let db: ?Db = null;

function init(config: {
  username: string, databaseName: string,
  password: string, host: string, port: string | number
}): Db {
  const url = `http://${config.host}:${config.port}`;
  db = new Arango({
    url
  });
  db.useDatabase(config.databaseName);
  db.useBasicAuth(config.username, config.password);
  return db;
}

function getDb(): Db {
  if (!db) throw new Error('Database was not initialized');
  return db;
}

export { init, getDb };
