// @flow
import * as jwt from 'jsonwebtoken';
import * as _ from 'lodash';
import { jwtSecret } from '../../config.dev';
import Document from './Document';
import { getDb } from '../arango';

const availableSources = ['local', 'facebook'];

const state = {
  collectionName: 'users',
  title: 'user',
  saveTime: true
};

// document = {
//   _key: string,
//   _id: string,
//   name: string,
//   extra: string,
//   masterAuth: string,
//   updatedAt: string,
//   createdAt: string
// };

const doc = Document(state);

const User = {

  ...doc,

  decode(token) {
    return jwt.decode(token, jwtSecret);
  },

  all() {
    return doc.collection().all()
      .then(users => users._result);
  },

  auths(userKey) {
    return Promise.all(availableSources.map(authType => getDb().collection(`auth_${authType}`).firstExample({ _key: userKey }).catch(() => null)))
      .then(auths => auths
        .map((auth, idx) => {
          if (!auth) return null;
          return {
            type: availableSources[idx],
            ...auth
          };
        })
        .filter(_.negate(_.isNull)));
  }
};

export default User;
