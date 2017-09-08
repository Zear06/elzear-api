import ApiError from '../ApiError';
import bcrypt from 'bcryptjs';
import Auth from './Auth';
import { passwordSalt } from '../../config.dev';
import * as _ from 'lodash';
import { db } from '../arango';
import User from './User';

function hash(username, password) {
  return bcrypt.hash(`${username}${passwordSalt}${password}`, 5);
}

class AuthLocal extends Auth {
  static collectionName = 'auth_local';
  static title = 'authLocal';

  static saveAuthLocal(payload) {
    const { _key, username, passwordHash } = payload;
    return this.save({
      _key,
      username,
      passwordHash
    }, { returnNew: true })
      .catch(e => {
        console.log('e', e);
        throw e;
      });
  }

  static credentials2User(payload) {
    return this.collection().firstExample({ username: payload.username })
      .then((authLocal) => {
        return bcrypt.compare(`${payload.username}${passwordSalt}${payload.password}`, authLocal.passwordHash)
          .then((isValid) => {
            if (isValid) {
              return Auth.userPlusAuths(authLocal._key);
            } else {
              throw new ApiError(401, 'Invalid login');
            }
          })
      })
      .catch((e) => {
        throw new ApiError(401, 'Invalid login', e);
      });
  }

  static login(payload: Object): Promise<any> {
    return AuthLocal.credentials2User(payload);
  }


  static register(payload: Object): Promise<any> {
    const { username, password } = payload;
    return this.validate(payload)
      .then(() => hash(username, password))
      .then((passwordHash) => {
        return User.save({
          name: username,
          masterAuth: 'local'
        }, { returnNew: true })
          .then(user => {
            return this.save({
              username,
              passwordHash,
              _key: user.new._key
            })
              .then(() => Auth.userPlusAuths(user.new._key))
          });
      })
      .catch((err) => {
        throw new ApiError(400, null, err);
      });
  }

  static add(payload: Object, userKey) {
    const { username, password } = payload;
    return this.validate(payload)
      .then(() => hash(username, password))
      .then((passwordHash) => {
        return Promise.all([
          AuthLocal.saveAuthLocal({
            _key: userKey,
            username,
            passwordHash
          }),
          db.collection('users')
            .update(userKey, { updatedAt: new Date() }, { returnNew: true })
        ])
          .then(() => Auth.userPlusAuths(userKey));
      })
      .catch((err) => {
        throw new ApiError(400, null, err);
      });
  }

  static validate(payload, currentUsername) {
    const { username, password } = payload;
    if (!username || !password) {
      throw new ApiError(400, 'Missing fields');
    }
    if (payload.username === currentUsername) {
      return Promise.resolve(true);
    }
    return this.some({ username })
      .then((hasSome) => {
        if (hasSome) {
          throw new ApiError(400, 'Username already in use')
        }
        return true;
      });
  }

  static authPatch(user, payload: Object): Promise<any> {
    const { username, password } = payload;
    const currentUsername = _.find(user.auths, { type: 'local' }).username;
    return this.validate(payload, currentUsername)
      .then(() => bcrypt.hash(`${username}${passwordSalt}${password}`, 5))
      .then((passwordHash) => {
        return Promise.all([
          db.collection('auth_local').update({ _key: user._key }, {
            username,
            passwordHash
          }, { returnNew: true }),
          db.collection('users')
            .update(user._id, { name: username, updatedAt: new Date() }, { returnNew: true })
        ])
          .then(() => Auth.userPlusAuths(user._key));
      })
      .catch((err) => {
        throw new ApiError(400, null, err);
      });
  }


}

export default AuthLocal;
