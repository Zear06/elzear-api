import { db } from '../arango';
import Document from './Document';
import User from './User';
import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';

const availableSources = ['local', 'facebook'];

class Auth extends Document {
  constructor(auth: Object) {
    if (new.target === Auth) {
      throw new TypeError('Cannot construct Abstract instances directly');
    }
    super(auth);
  }

  static setMaster(user, newMaster: 'local' | 'facebook') {
    return Promise.all(availableSources.map(
      source => db.collection(`auth_${source}`).update({
        _key: user._key
      }, {
        master: newMaster === source
      })
    ))
      .then(() => this.userPlusAuths(user._key));
  }

  static authDelete(user, type: 'local' | 'facebook') {
    return db.collection(`auth_${type}`).removeByExample({
      _key: user._key,
      master: false
    })
      .then(() => this.userPlusAuths(user._key));
  }

  static userPlusAuths(userKey) {
    return Promise.all([
      User.collection().firstExample({ _key: userKey }),
      ...availableSources.map(authType => db.collection(`auth_${authType}`).firstExample({ _key: userKey }).catch(() => null))
    ])
      .then((response) => {
        const [user, ...authss] = response;
        const auths = authss.map((auth, i) => (auth) ? {
            type: availableSources[i],
            ...auth
          } : null
        )
          .filter(_.negate(_.isNull));
        return ({
          ...user,
          auths
        });
      })
  }

  static toJwt(userPlusAuths) {
    return jwt.sign({
      _key: userPlusAuths._key,
      _id: userPlusAuths._id,
      _rev: userPlusAuths._rev,
      username: userPlusAuths.username,
      createdAt: userPlusAuths.createdAt,
      updatedAt: userPlusAuths.updatedAt,
      auths: userPlusAuths.auths
    }, 'server secret', {
      // expiresInMinutes: 120
    });
  }

  static generateToken(userPlusAuths) {
    return {
      user: userPlusAuths,
      token: Auth.toJwt(userPlusAuths)
    };
  }
}

export default Auth;
