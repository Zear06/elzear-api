// @flow
/* eslint-disable no-underscore-dangle */
import { Strategy, Strategy as FbStrat } from 'passport-facebook';
import * as _ from 'lodash';
import passport from 'koa-passport';
import { api, facebook } from '../../../config.dev';

['login', 'register', 'add'].forEach(stratName => {
  passport.use(`facebook${_.capitalize(stratName)}`, new FbStrat({
      callbackURL: `${api}/auth/facebook/${stratName}/callback`,
      successRedirect: '/api/success',
      failureRedirect: '/api',
      ...facebook
    },
    function (accessToken, refreshToken, profile, done) {
      return done(null, profile);
    })
  );
});

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

export {
  passport
};
