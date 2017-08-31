// @flow
import { passport } from './facebook';
import ApiError from '../ApiError';
import { UserArango } from '../schemas/User';
import { client, facebook, jwtSecret } from '../../config.dev';
import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';
import Auth from '../schemas/Auth';

function generateToken(user) {
  return {
    user,
    token: user.toJwt()
  };
}

function authPatch(ctx) {
  if (!ctx.params.authType) {
    throw new ApiError(400, 'Missing required parameter `q`');
  }
  return UserArango.authPatch(ctx.state.user, ctx.params.authType, ctx.request.body).then(user => generateToken(user));
}

function authLogin(ctx, next) {
  if (!ctx.params.authType) {
    throw new ApiError(401, 'Missing required parameter `q`');
  }

  switch (ctx.params.authType) {
    case 'local': {
      return UserArango.login('local', ctx.request.body).then(user => generateToken(user));
    }
    case 'facebook': {
      return passport.authenticate('facebookLogin')(ctx, next);
    }
    default: {
      throw new ApiError(401, 'invalid login type');
    }
  }
}

function authRegister(ctx, next) {

  if (!ctx.params.authType) {
    throw new ApiError(401, 'Missing required parameter `q`');
  }

  switch (ctx.params.authType) {
    case 'local':
      return UserArango.register('local', ctx.request.body).then(user => generateToken(user));

    case 'facebook':
      return passport.authenticate('facebookRegister')(ctx, next);
    default:
      throw new ApiError(401, 'invalid register type');
  }
}

function authAdd(ctx, next) {
  if (!ctx.params.authType) {
    throw new ApiError('missing authType param');
  }

  ctx.session.userToken = null;
  switch (ctx.params.authType) {
    case 'local':
      return localAdd(ctx, next).then(user => generateToken(user, res));
    case 'facebook':
      const userToken = ctx.query.token;
      return new Promise((resolve, reject) => {
        return jwt.verify(userToken, jwtSecret, function (err) {
          if (err) {
            reject(new ApiError(401, err.message));
            // throw new ApiError(401, err.message);
          } else {
            ctx.session.userToken = userToken;
            resolve(true);
          }
        });
      })
        .then(() => passport.authenticate('facebookAdd')(ctx, next));

    default:
      throw new Error('invalid login type');
  }
}

const fcts = {
  login: UserArango.login,
  register: UserArango.register,
  add: UserArango.add
};

function callback(endpoint) {
  const fct = fcts[endpoint];
  return function (ctx) {
    return wrappers[ctx.params.authType](ctx, fct, `${ctx.params.authType}${_.capitalize(endpoint)}`);
  }
}

const wrappers = {
  facebook: function fbWrap(ctx, callback, stratName) {
    console.log('arguments', arguments);

    return passport.authenticate(stratName, {
      successRedirect: '/api/success',
      failureRedirect: '/api'
    })(ctx)
      .then(() => {
        return callback('facebook', ctx.req.user, ctx.session.userToken || null)
      })
      .then(user => generateToken(user))
      .then((tokenResp) => {
        ctx.status = 301;
        ctx.body = 'Redirecting to shopping cart';
        ctx.response.redirect(`${client}/#/?token=${tokenResp.token}`);
      })
      .catch((e) => {
        ctx.status = e.status || 500;
        ctx.body = { message: e.message };
        ctx.response.redirect(`${client}/#/?error&code${ctx.status}&message=${encodeURI(e.message)}`);
      });
  }
};

function setMaster(ctx, next) {
  return Auth.setMaster(ctx.state.user, ctx.params.authType);
}

function authDelete(ctx, next) {
  return Auth.authDelete(ctx.state.user, ctx.params.authType);
}

export {
  authLogin,
  authRegister,
  authAdd,
  authPatch,
  callback,

  setMaster,
  authDelete
};
