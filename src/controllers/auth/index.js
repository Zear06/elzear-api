import type { Middleware, Context } from 'koa';
import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';
import passport from './facebook';
import ApiError from '../../ApiError';
import { client, jwtSecret } from '../../../config.dev';
import Auth from '../../schemas/Auth';
import AuthLocal from '../../schemas/AuthLocal';
import AuthFb from '../../schemas/AuthFacebook';

function authPatch(ctx: Context) {
  if (ctx.params.authType === 'local') {
    return AuthLocal.authPatch(ctx.state.user, ctx.request.body).then(Auth.generateToken);
  }
  throw new ApiError(400, 'Invalid Auth type');
}

function authLogin(ctx: Context, next: Middleware) {
  switch (ctx.params.authType) {
    case 'local': {
      return AuthLocal.login(ctx.request.body).then(Auth.generateToken);
    }
    case 'facebook': {
      return passport.authenticate('facebookLogin')(ctx, next);
    }
    default: {
      throw new ApiError(401, 'invalid login type');
    }
  }
}

function authRegister(ctx: Context, next: Middleware) {
  switch (ctx.params.authType) {
    case 'local':
      return AuthLocal.register(ctx.request.body).then(Auth.generateToken);
    case 'facebook':
      return passport.authenticate('facebookRegister')(ctx, next);
    default:
      throw new ApiError(401, 'invalid register type');
  }
}

const authAdd: Middleware = (ctx: Context, next: Middleware) => {
  ctx.session.userToken = null;
  switch (ctx.params.authType) {
    case 'local':
      return AuthLocal.add(ctx.request.body, ctx.state.user._key).then(Auth.generateToken);
    case 'facebook': {
      const userToken = ctx.query.token;
      return new Promise((resolve, reject) => jwt.verify(userToken, jwtSecret, (err) => {
        if (err) {
          reject(new ApiError(401, err.message));
        } else {
          ctx.session.userToken = userToken;
          resolve(true);
        }
      }))
        .then(() => passport.authenticate('facebookAdd')(ctx, next));
    }
    default:
      throw new Error('invalid login type');
  }
};

const authClasses = {
  facebook: AuthFb,
  local: AuthLocal
};


type ContextUser = Context & { req: { user: {} } };
const wrappers = {
  facebook: function fbWrap(ctx: ContextUser, cb, stratName) {
    return passport.authenticate(stratName, {
      successRedirect: '/api/success',
      failureRedirect: '/api'
    })(ctx)
      .then(() => cb(ctx.req.user, ctx.session.userToken || null))
      .then(Auth.generateToken)
      .then((tokenResp) => {
        ctx.status = 301;
        ctx.body = 'Redirecting to shopping cart';
        ctx.response.redirect(`${client}/?token=${tokenResp.token}`);
      })
      .catch((e) => {
        ctx.status = e.status || 500;
        ctx.body = { message: e.message };
        ctx.response.redirect(`${client}/?error&code=${ctx.status}&message=${encodeURI(e.message)}`);
      });
  }
};

function callback(endpoint: string): Middleware {
  return function authCbs(ctx: Context) {
    const authClass = authClasses[ctx.params.authType];
    const fct = {
      login: authClass.login,
      register: authClass.register,
      add: authClass.add
    };

    return wrappers[ctx.params.authType](ctx, fct[endpoint], `${ctx.params.authType}${_.capitalize(endpoint)}`);
  };
}

const setMaster: Middleware = (c: Context) => Auth.setMaster(c.state.user, c.params.authType);

const authDelete: Middleware = (c: Context) => Auth.authDelete(c.state.user, c.params.authType);

export {
  authLogin,
  authRegister,
  authAdd,
  authPatch,
  callback,

  setMaster,
  authDelete
};
