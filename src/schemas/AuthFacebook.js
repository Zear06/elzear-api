import { get as getDb } from '../arango';
import { UserArango } from './User';
import ApiError from '../ApiError';
import Auth from './Auth';

class AuthFb extends Auth {
  constructor(auth: Object) {
    super(auth);
  }

  static save(user, payload) {
    const { data } = payload;
    const master = !!payload.setMaster;
    const db = getDb();
    return db.collection('auth_facebook').save({
      _key: user._key,
      ...data,
      master
    }, { returnNew: true })
      .catch(e => {
        throw new ApiError(400, null, e);
      });
  }

  static profile2User(payload) {
    const db = getDb();
    return db.collection('auth_facebook').firstExample({ id: payload.id })
      .then((authFb) => UserArango.getFromKey(authFb._key))
  }
}

export default AuthFb;
