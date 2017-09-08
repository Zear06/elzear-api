import { db } from '../arango';
import Document from './Document';
import User from './User';
import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';
import ApiError from '../ApiError';

const availableSources = ['local', 'facebook'];

function getUsernameName(authType, data) {
  if (authType === 'local') {
    return data.username;
  }
  if (authType === 'facebook') {
    return data.displayName;
  }
}

class Auth extends Document {
  static setMaster(user, newMaster: 'local' | 'facebook') {
    return db.collection(`auth_${newMaster}`)
      .firstExample({ _key: user._key })
      .then((auth) => User.collection().update({
        _key: user._key,
      }, {
        masterAuth: newMaster,
        name: getUsernameName(newMaster, auth)
      }))
      .then(() => this.userPlusAuths(user._key));
  }

  static authDelete(user, type: 'local' | 'facebook') {
    return User.collection().firstExample({ _key: user._key })
      .then(user => {
        if (user.masterAuth === type) {
          throw new ApiError(400, 'Cannot delete master auth');
        }
        return db.collection(`auth_${type}`).removeByExample({
          _key: user._key
        });
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
