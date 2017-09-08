// @flow
import * as jwt from 'jsonwebtoken';
import { jwtSecret } from '../../config.dev';
import Document from './Document';
import { db } from '../arango';
import * as _ from 'lodash';

const availableSources = ['local', 'facebook'];

class User extends Document {
  static collectionName = 'users';
  static title = 'user';
  static saveTime = true;

  document: {
    _key: string,
    _id: string,
    name: string,
    masterAuth: string,
    updatedAt: string,
    createdAt: string
  };

  static decode(token) {
    return jwt.decode(token, jwtSecret);
  }

  static all() {
    return this.collection().all()
      .then(users => users._result);
  }

  static auths(userKey) {
    return Promise.all(
      availableSources.map(authType => db.collection(`auth_${authType}`).firstExample({ _key: userKey }).catch(() => null))
    )
      .then(auths => {
        return auths
          .map((auth, idx) => {
            if (!auth) return null;
            return {
              type: availableSources[idx],
              ...auth
            }
          })
          .filter(_.negate(_.isNull))
      });
  }
}

export default User;
