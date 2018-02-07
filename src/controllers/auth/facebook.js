import { Strategy as FbStrat } from 'passport-facebook';
import * as _ from 'lodash';
import passport from 'koa-passport';
import { api, facebook } from '../../../config.dev';

['login', 'register', 'add'].forEach((stratName) => {
  passport.use(
    `facebook${_.capitalize(stratName)}`,
    new FbStrat({
      callbackURL: `${api}/auth/facebook/${stratName}/callback`,
      successRedirect: '/api/success',
      failureRedirect: '/api',
      ...facebook
    }, ((accessToken, refreshToken, profile, done) => done(null, profile)))
  );
});

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
export default passport;
