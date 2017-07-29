import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as _ from 'lodash';
import AuthLocal, { getProfile as localProfile } from './AuthLocal';
import { getProfile as facebookProfile } from './AuthFacebook';
import db from '../arango';

mongoose.createConnection('mongodb://localhost/test');

const userSchema = mongoose.Schema({
  username: { type: String },
  localProfile: { type: Object },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  auths: [{
    master: Boolean,
    source: String,
    auth_id: String
  }]
});

userSchema.pre('save', function save(next) {
  // get the current date
  const currentDate = new Date();
  this.updated_at = currentDate;
  if (!this.created_at) {
    this.created_at = currentDate;
  }
  next();
});

userSchema.methods.validHash = function validHash(hash) {
  const authLocal = this.auths.find(auth => auth.source === 'local');
  if (!authLocal) return false;
  return AuthLocal.findOne({ _id: authLocal.auth_id })
    .then(a => bcrypt.compare(hash, a.passwordHash))
    .then(valid => (valid ? this : false));
};

function getProfile(source) {
  switch (source) {
    case 'local': return localProfile;
    case 'facebook': return facebookProfile;
    default: throw source;
  }
}

userSchema.methods.public = function publicUser() {
  return {
    created_at: this.created_at,
    updated_at: this.updated_at,
    auths: this.auths.map(auth => ({
      source: auth.source,
      master: auth.master,
      profile: getProfile(auth.source)(auth.auth_id)
    }))
  };
};

const User = mongoose.model('User', userSchema);

class UserArango {
  constructor(payload) {
    if (!_.has(payload, 'username')) {
      throw new Error('User must have an username');
    }
    const now = new Date();
    this.data = {
      username: payload.username,
      createdAt: now,
      updatedAt: now
    }
  }

  save() {
    return db.collection('users').save(this.data)
  }
}


export default User;
export {
  UserArango
};
