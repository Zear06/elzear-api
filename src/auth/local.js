// @flow
import passport from 'passport';
import bcrypt from 'bcryptjs';
import { Strategy } from 'passport-local';
import type { $Request, $Response, $Next } from 'express';
import User from '../schemas/User';
import AuthLocal from '../schemas/AuthLocal';

/* eslint-disable no-underscore-dangle */

const source = 'local';

passport.use(new Strategy(
  (username, password, done) => User.findOne({ username })
      .then((user) => {
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        return bcrypt.hash(password, 5)
          .then(() => user.validHash(password))
          .then((userMath) => {
            if (userMath) {
              return done(null, userMath);
            }
            return done(null, false, { message: 'Incorrect password.' });
          })
          .catch(() => done(null, false, { message: 'Incorrect password.' }));
      })
));

function localLogin(req: $Request, res: $Response, next: $Next) {
  console.log('req.body', req.body);

  if (!req.body.username || !req.body.password) {
    throw next(Error('Missing'));
  }
  const { username, password } = req.body;

  return User.findOne({ username })
    .then((user) => {
    console.log('user', user);

      if (!user) {
        throw Error('Incorrect username.');
      }
      return user.validHash(password);
    })
    .then((userMatch) => {
    console.log('userMatch', userMatch);

      if (userMatch) {
        return userMatch;
      }
      throw Error('Incorrect username.');
    })
    .catch((e) => {
    console.log('e', e);


      return next(e);
    });
}


function localRegister(req: $Request, res: $Response, next: $Next) {
  if (!req.body.username || !req.body.password) {
    throw next(Error('Missing'));
  }

  const newUser = new User({
    username: req.body.username,
  });

  return bcrypt.hash(req.body.password, 5)
    .then((passwordHash) => {
    console.log('passwordHash', passwordHash);

      const newAuthLocal = new AuthLocal({
        user_id: newUser._id,
        passwordHash
      });
      return newAuthLocal.save();
    })
    .then((authLocal) => {
    console.log('authLocal', authLocal);

      newUser.auths = [{
        source,
        master: true,
        auth_id: authLocal._id
      }];
      return newUser.save();
    })
    .catch((err) => {
    console.log('err', err);

      res.status(400)
        .send(err);
    });
}

export {
  localLogin,
  localRegister
};
