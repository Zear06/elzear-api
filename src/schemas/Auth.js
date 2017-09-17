import { db } from '../arango';
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

function getExtra(authType, data) {
  if (authType === 'local') {
    return null;
  }
  if (authType === 'facebook') {
    return data.id;
  }
}

const Auth = {
  setMaster(user, newMaster: 'local' | 'facebook') {
    return db.collection(`auth_${newMaster}`)
      .firstExample({ _key: user._key })
      .then((auth) => User.collection().update({
        _key: user._key,
      }, {
        masterAuth: newMaster,
        name: getUsernameName(newMaster, auth),
        extra: getExtra(newMaster, auth)
      }))
      .then(() => this.userPlusAuths(user._key));
  },

  authDelete(user, type: 'local' | 'facebook') {
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
  },

  userPlusAuths(userKey) {
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
  },

  userEdit(user, data) {
    const payload = {};
    if (data.masterAuth && data.masterAuth !== user.masterAuth) {
      if (!availableSources.includes(data.masterAuth)) {
        throw new ApiError(400, 'Invalid Auth type');
      }
      return db.collection(`auth_${data.masterAuth}`)
        .firstExample({ _key: user._key })
        .then((auth) => {
          payload.masterAuth = data.masterAuth;
          payload.name = getUsernameName(data.masterAuth, auth);
          payload.extra = getExtra(data.masterAuth, auth);
          return User.patchByKey(user._key, payload);
        });
    }
    return User.patchByKey(user._key, payload);
  },

  toJwt(userPlusAuths) {
    return jwt.sign({
      _key: userPlusAuths._key,
      _id: userPlusAuths._id,
      _rev: userPlusAuths._rev,
      name: userPlusAuths.name,
      masterAuth: userPlusAuths.masterAuth,
      createdAt: userPlusAuths.createdAt,
      updatedAt: userPlusAuths.updatedAt
    }, 'server secret', {
      // expiresInMinutes: 120
    });
  },

  generateToken(userPlusAuths) {
    return {
      user: userPlusAuths,
      token: Auth.toJwt(userPlusAuths)
    };
  }
};

export default Auth;
