import Arango from 'arangojs';
import { arango } from '../config.dev';

const url = `http://${arango.username}:${arango.password}@${arango.host}:${arango.port}`;
const db = Arango({
  url,
  databaseName: arango.databaseName
});

export default db;
