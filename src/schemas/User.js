// @flow
import * as jwt from 'jsonwebtoken';
import { jwtSecret } from '../../config.dev';
import Document from './Document';

const authTypes = ['local', 'facebook'];

class User extends Document {
  static collectionName = 'users';
  static title = 'user';
  static saveTime = true;

  document: {
    _key: string,
    _id: string,
    name: string,
    updatedAt: string,
    createdAt: string
  };

  constructor(user: Object<any>, auths: Array<any>) {
    super(user);
    this.auths = auths;
  }

  static decode(token) {
    return jwt.decode(token, jwtSecret);
  }

  static all() {
    return this.collection().all()
      .then(users => ({
        data: users._result
      }));
  }
}

export default User;
