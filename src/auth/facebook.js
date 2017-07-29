// @flow
/* eslint-disable no-underscore-dangle */
import { Strategy } from 'passport-facebook';
import passport from 'passport';
import type { $Next, $Request, $Response } from 'express';
import { api, client, facebook } from '../../config.dev';
import AuthFacebook from '../schemas/AuthFacebook';
import User from '../schemas/User';
import { user2jwt } from './index';

const source = 'facebook';

passport.use('facebookRegister', new Strategy({
  callbackURL: `${api}/auth/facebook/register/callback`,
  ...facebook
}, (accessToken, refreshToken, profile, done) => done(profile)));

passport.use('facebookLogin', new Strategy({
  callbackURL: `${api}/auth/facebook/login/callback`,
  ...facebook
}, (accessToken, refreshToken, profile, done) => done(profile)));

function facebookRegister(req: $Request, res: $Response, next: $Next) {
  return passport.authenticate('facebookRegister')(req, res, next);
}

function facebookLogin(req: $Request, res: $Response, next: $Next) {
  return passport.authenticate('facebookLogin')(req, res, next);
}

function facebookLoginCallback(req: $Request, res: $Response, next: $Next) {
  passport.authenticate('facebookLogin', {
    failureRedirect: `${client}/login-failed`,
    session: false
  }, (profile) => {
    AuthFacebook.findOne({ id: profile.id })
      .then(auth => User.findOne({ _id: auth.user_id }))
      .then((user) => {
        if (user === null) {
          throw Error('Unknown user');
        }
        return res.redirect(`${client}/#/?token=${user2jwt(user)}`);
      })
      .catch(err => res.redirect(`${client}/#/?err=_${err.message}`));
  })(req, res, next);
}

function facebookRegisterCallback(req: $Request, res: $Response, next: $Next) {
  passport.authenticate('facebookRegister', {
    failureRedirect: `${client}/auth-failed`,
    session: false
  }, (profile) => {
    const auth = {
      source,
      auth_id: profile.id
    };
    const newUser = new User({ auths: [{ master: true, ...auth }] });
    const newAuthFacebook = new AuthFacebook({
      user_id: newUser._id,
      id: profile.id,
      profile
    });

    User.findOne({ auths: { source, auth_id: profile.id } })
      .then((user) => {
        if (user !== null) {
          throw Error('this Facebook account is already registered');
        } else {
          return newAuthFacebook.save();
        }
      })
      .then(() => newUser.save())
      .then(user => res.redirect(`${client}/#/?token=${user2jwt(user)}`))
      .catch(err => res.redirect(`${client}/#/?err=_${err.message}`));
  })(req, res, next);
}

export {
  facebookLogin,
  facebookRegister,
  facebookLoginCallback,
  facebookRegisterCallback
};
