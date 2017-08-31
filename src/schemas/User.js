// @flow
import bcrypt from 'bcryptjs';
import * as _ from 'lodash';
import { get as getDb } from '../arango';
import { jwtSecret } from '../../config.dev';
import * as jwt from 'jsonwebtoken';
import ApiError from '../ApiError';
import { AuthLocalArango } from './AuthLocal';
import AuthFb from './AuthFacebook';

const salt = '5@|7-';
const authTypes = ['local', 'facebook'];


class UserArango {
  _key: string;
  _id: string;
  auths: Array<Object>;
  username: string;
  updatedAt: string;
  createdAt: string;

  constructor(user: Object) {
    Object.assign(this, user);
  }

  static save(payload, authPayload): Promise<UserArango> {
    if (!_.has(payload, 'username')) {
      throw new Error('User must have an username');
    }
    if (authPayload.type === 'local') {
    } else if (authPayload.type === 'facebook') {
    } else {
      throw new Error('Invalid authPayload type');
    }

    const authCollection = `auth_${authPayload.type}`;
    const now = new Date();
    const data = {
      username: payload.username,
      createdAt: now,
      updatedAt: now
    };

    const db = getDb();

    return db.collection('users')
      .save(data, { returnNew: true })
      .then((user) => {
        return db.collection(authCollection).save({
          _key: user._key,
          master: true,
          ...authPayload.data
        }, { returnNew: true })
          .then((auth) => {
            return new UserArango({
              auths: [{ type: authCollection, data: auth.new }],
              ...user.new
            });
          })
      });
  }

  addAuth(authPayload: Object): Promise<UserArango> {
    const authCollection = `auth_${authPayload.type}`;
    return db.collection(authCollection).save({
      _key: this._key,
      master: false,
      ...authPayload.data
    })
      .then(() => UserArango.getFromKey(this._key))
  }

  static getFromToken(token: string): Promise<UserArango> {
    const u = jwt.decode(token, jwtSecret);
    return this.getFromKey(u._key);
  }

  static getFromKey(key): Promise<UserArango> {
    const db = getDb();
    return Promise.all([
      db.collection('users').firstExample({ _key: key }).catch(() => null),
      ...authTypes.map(authType => db.collection(`auth_${authType}`).firstExample({ _key: key }).catch(() => null))
    ])
      .then((response) => {
        const [user, ...authss] = response;
        const auths = authss.map((auth, i) => (auth) ? {
            type: authTypes[i],
            ...auth
          } : null
        )
          .filter(_.negate(_.isNull));
        return new UserArango({
          ...user,
          auths
        });
      })
  }

  toJwt() {
    return jwt.sign({
      _key: this._key,
      _id: this._id,
      _rev: this._rev,
      username: this.username,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      auths: this.auths
    }, 'server secret', {
      // expiresInMinutes: 120
    });
  }

  static authPatch(user, type: string, payload: Object): Promise<UserArango> {
    if (type === 'local') {
      const { username, password } = payload;
      if (!username || !password) {
        throw new ApiError(400, 'Missing fields');
      }
      const isFree = () => {
        const authLocal = _.find(user.auths, { type: 'local' });
        if (authLocal.username === username) {
          return Promise.resolve(true);
        }
        return AuthLocalArango.isFree(username)
      };
      return isFree()
        .then(() => bcrypt.hash(`${username}${salt}${password}`, 5))
        .then((passwordHash) => {
          const db = getDb();
          return Promise.all([
            db.collection('auth_local').update({ _key: user._key }, {
              username,
              passwordHash
            }, { returnNew: true }),
            db.collection('users')
              .update(user._id, { updatedAt: new Date() }, { returnNew: true })
          ])
            .then(([auth, user]) => {
              return new UserArango({
                auths: [{ type: 'auth_local', data: auth.new }],
                ...user.new
              });
            });
        })
        .catch((err) => {
          throw new ApiError(400, null, err);
        });
    }
  }

  static register(type: string, payload: Object): Promise<UserArango> {
    if (type === 'local') {
      const { username, password } = payload;
      if (!username || !password) {
        throw new ApiError(400, 'Missing fields');
      }
      return AuthLocalArango.isFree(username)
        .then(() => bcrypt.hash(`${username}${salt}${password}`, 5))
        .then((passwordHash) => {
          return this.save({
            username
          }, {
            type: 'local',
            data: { username, passwordHash }
          })
        })
        .catch((err) => {
          throw new ApiError(400, null, err);
        });
    }
    if (type === 'facebook') {
      return UserArango.save({
        username: payload.displayName
      }, {
        type: 'facebook',
        data: payload
      })
    }
  }


  static add(type: string, payload: Object, userToken) {
    if (type === 'local') {
      const { username, password } = payload;
      if (!username || !password) {
        throw new ApiError(400, 'Missing fields');
      }
      return AuthLocalArango.isFree(username)
        .then(() => bcrypt.hash(`${username}${salt}${password}`, 5))
        .then((passwordHash) => {
          const db = getDb();
          return Promise.all([
            AuthLocalArango.save({
              _key: jwt.decode(userToken, jwtSecret)._key,
              username,
              passwordHash,
              master: false
            }),
            db.collection('users')
              .update(user._id, { updatedAt: new Date() }, { returnNew: true })
          ])
            .then(([auth, user]) => {
              return new UserArango({
                auths: [{ type: 'auth_local', data: auth.new }],
                ...user.new
              });
            });
        })
        .catch((err) => {
          throw new ApiError(400, null, err);
        });
    }

    if (type === 'facebook') {
      const user = jwt.decode(userToken, jwtSecret);
      return AuthFb.save(user, payload)
        .then(authFb => UserArango.getFromKey(user._key))
    }
  }

  static login(type: string, payload: Object): Promise<UserArango> {
    if (type === 'local') {
      return AuthLocalArango.credentials2User(payload);
    }
    if (type === 'facebook') {
      return AuthFb.profile2User(payload);
    }
    return Promise.reject('Invalid auth')
  }
}

export {
  UserArango
};
