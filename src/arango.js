import Arango from 'arangojs';

let instance = null;

function init(config) {
  const url = `http://${config.username}:${config.password}@${config.host}:${config.port}`;
  instance = new Arango({
    url,
    databaseName: config.databaseName
  });
}

function get() {
  return instance;
}

export default instance;
export { init, get };
