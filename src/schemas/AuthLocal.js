import { db } from '../arango';
import ApiError from '../ApiError';
import { UserArango } from './User';
import bcrypt from 'bcryptjs';
import Auth from './Auth';
import { passwordSalt } from '../../config.dev';

class AuthLocalArango extends Auth {
  constructor(auth: Object) {
    super(auth);
    Object.assign(this, auth);
  }

  static isFree(username) {
    return db.collection('auth_local').firstExample({ username })
      .then(() => {
        throw new ApiError(400, 'Username already in use')
      }, () => true)
  }

  static save(payload) {
    const { _key, username, passwordHash } = payload;
    const master = !!payload.setMaster;
    return db.collection('auth_local').save({
      _key,
      username,
      passwordHash,
      master
    }, { returnNew: true })
      .catch(e => {
        console.log('e', e);

        throw e;
      });
  }

  static credentials2User(payload) {
    return db.collection('auth_local').firstExample({ username: payload.username })
      .then((authLocal) => {
        return bcrypt.compare(`${payload.username}${passwordSalt}${payload.password}`, authLocal.passwordHash)
          .then((isValid) => {
            if (isValid) {
              return UserArango.getFromKey(authLocal._key);
            } else {
              throw new ApiError(401, 'Invalid login');
            }
          })
      })
      .catch((e) => {
        throw new ApiError(401, 'Invalid login', e);
      });
  }

  static add(user, payload) {
    const { username, password } = payload;
    return AuthLocalArango.isFree(username)
      .then(() => bcrypt.hash(`${username}${passwordSalt}${password}`, 5))
      .then((passwordHash) => AuthLocalArango.save({
        _key: user._key,
        username,
        passwordHash,
        master: false
      }));
  }
}

export {
  AuthLocalArango
};
