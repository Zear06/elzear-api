// @flow
import jwt from 'jsonwebtoken';
import type { $Next, $Request, $Response, Middleware } from 'express';
import { localLogin, localRegister } from './local';
import { facebookLogin, facebookLoginCallback, facebookRegister, facebookRegisterCallback } from './facebook';

function user2jwt(user) {
  console.log('ususer2jwter', user);

  return jwt.sign({
    id: user.id,
    username: user.username,
    localProfile: user.localProfile,
    created_at: user.created_at,
    updated_at: user.updated_at,
    auths: user.auths
  }, 'server secret', {
    // expiresInMinutes: 120
  });
}

function generateToken(user, res) {
  console.log('user', user);

  res.status(200).json({
    user,
    token: user2jwt(user)
  });
}

function authLogin(req: $Request, res: $Response, next: $Next) {
  console.log('req.params', req.params);

  if (!req.params.authType) {
    return res.json({
      error: 'Missing required parameter `q`'
    });
  }
  switch (req.params.authType) {
    case 'local': {
      return localLogin(req, res, next).then(user => generateToken(user, res));
    }
    case 'facebook': {
      return facebookLogin(req, res, next);
    }
    default: {
      throw new Error('invalid login type');
    }
  }
}

function authRegister(req: $Request, res: $Response, next: $Next) {
  if (!req.params.authType) {
    return res.json({
      error: 'Missing required parameter `q`'
    });
  }

  switch (req.params.authType) {
    case 'local':
      return localRegister(req, res, next).then(user => generateToken(user, res));
    case 'facebook':
      return facebookRegister(req, res, next);
    default:
      throw new Error('invalid login type');
  }
}


function registerCallback(req: $Request, res: $Response, next: $Next) {
  if (!req.params.authType) {
    return res.json({
      error: 'Missing required parameter `q`'
    });
  }
  switch (req.params.authType) {
    case 'facebook':
      return facebookRegisterCallback(req, res, next);
    default:
      throw new Error('invalid login type');
  }
}
function loginCallback(req: $Request, res: $Response, next: $Next) {
  if (!req.params.authType) {
    return res.json({
      error: 'Missing required parameter `q`'
    });
  }
  switch (req.params.authType) {
    case 'facebook':
      return facebookLoginCallback(req, res, next);
    default:
      throw new Error('invalid login type');
  }
}


export {
  user2jwt,
  authLogin,
  authRegister,
  loginCallback,
  registerCallback
};
