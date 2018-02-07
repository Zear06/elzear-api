import bcrypt from 'bcryptjs';
import ApiError from '../ApiError';
import Auth from './Auth';
import Document from './Document';
import { passwordSalt } from '../../config.dev';
import { getDb } from '../arango';
import User from './User';

function hash(username, password) {
  return bcrypt.hash(`${username}${passwordSalt}${password}`, 5);
}


const refinePayload = (payload: mixed): { username: string, password: string } => {
  if (payload
    && typeof payload === 'object'
    && typeof payload.username === 'string'
    && typeof payload.password === 'string') {
    return { username: payload.username, password: payload.password };
  }
  throw new ApiError(400, 'Invalid payload');
};

const state = {
  collectionName: 'auth_local',
  title: 'authLocal',
  saveTime: true
};

const doc = Document(state);

const AuthLocal = {
  ...doc,
  ...Auth,
  saveAuthLocal(payload) {
    const { _key, username, passwordHash } = payload;
    return this.save({
      _key,
      username,
      passwordHash
    }, { returnNew: true })
      .catch((e) => {
        throw e;
      });
  },

  credentials2User({ username, password }: { username: string, password: string }) {
    return this.collection().firstExample({ username })
      .then(authLocal => bcrypt.compare(`${username}${passwordSalt}${password}`, authLocal.passwordHash)
        .then((isValid) => {
          if (isValid) {
            return Auth.userPlusAuths(authLocal._key);
          }
          throw new ApiError(401, 'Invalid login');
        }))
      .catch((e) => {
        throw new ApiError(401, 'Invalid login', e);
      });
  },

  login(payload: mixed): Promise<any> {
    return AuthLocal.credentials2User(refinePayload(payload));
  },


  register(payload: mixed): Promise<any> {
    const { username, password } = refinePayload(payload);
    return this.validate(payload)
      .then(() => hash(username, password))
      .then(passwordHash => User.save({
        name: username,
        masterAuth: 'local',
        extra: null
      }, { returnNew: true })
        .then(user => this.save({
          username,
          passwordHash,
          _key: user.new._key
        })
          .then(() => Auth.userPlusAuths(user.new._key))))
      .catch((err) => {
        throw new ApiError(400, null, err);
      });
  },

  add(payload: mixed, userKey) {
    const { username, password } = refinePayload(payload);
    return this.validate({ username, password })
      .then(() => hash(username, password))
      .then(passwordHash => Promise.all([
        AuthLocal.saveAuthLocal({
          _key: userKey,
          username,
          passwordHash
        }),
        getDb().collection('users')
          .update(userKey, { updatedAt: new Date() }, { returnNew: true })
      ])
        .then(() => Auth.userPlusAuths(userKey)))
      .catch((err) => {
        throw new ApiError(400, null, err);
      });
  },

  validate(payload, currentUsername) {
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
          throw new ApiError(400, 'Username already in use');
        }
        return true;
      });
  },

  authPatch(user, payload: mixed): Promise<any> {
    const { username, password } = refinePayload(payload);
    return this.getFromKey(user._key).then((auth) => {
      const currentUsername = auth.username;
      return this.validate(payload, currentUsername)
        .then(() => bcrypt.hash(`${username}${passwordSalt}${password}`, 5))
        .then(passwordHash => Promise.all([
          getDb().collection('auth_local').update({ _key: user._key }, {
            username,
            passwordHash
          }, { returnNew: true }),
          getDb().collection('users')
            .update(user._id, { name: username, updatedAt: new Date() }, { returnNew: true })
        ])
          .then(() => Auth.userPlusAuths(user._key)));
    })
      .catch((err) => {
        throw new ApiError(400, null, err);
      });
  }


};

export default AuthLocal;
