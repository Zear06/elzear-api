import { get as getDb } from '../arango';
import { UserArango } from './User';

const availableSources = ['local', 'facebook'];

class Auth {
  constructor(auth: Object) {
    Object.assign(this, auth);
  }

  static setMaster(user, newMaster: 'local' | 'facebook') {
    const db = getDb();
    return Promise.all(availableSources.map(
      source => db.collection(`auth_${source}`).update({
        _key: user._key
      }, {
        master: newMaster === source
      })
    ))
      .then(() => UserArango.getFromKey(user._key));
  }

  static authDelete(user, type: 'local' | 'facebook') {
    const db = getDb();
    return db.collection(`auth_${type}`).removeByExample({
      _key: user._key,
      master: false
    })
      .then(() => UserArango.getFromKey(user._key));
  }
}

export default Auth;
