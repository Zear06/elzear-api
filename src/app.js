import json from 'koa-json';
import Koa from 'koa';
import logger from 'koa-logger';
import cors from 'koa-cors';
import bodyParserKoa from 'koa-bodyparser';
import session from 'koa-session';
import router from './router';
import { passport } from './auth/facebook';

const CONFIG = {
  key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. default is false **/
};

const appKoa = new Koa();

appKoa.keys = ['some secret hurr'];
appKoa.use(json());
appKoa.use(logger());
appKoa.use(bodyParserKoa());
appKoa.use(cors());
appKoa.use(passport.initialize());
appKoa.use(session(appKoa));

const bypassWrapper = [];

['facebook'].forEach(source => {
  ['register', 'login', 'add'].forEach(type => {
    bypassWrapper.push(`/auth/${source}/${type}`);
    bypassWrapper.push(`/auth/${source}/${type}/callback`);
  })
});

//Error handling middleware
appKoa.use(async function (ctx, next) {
  try {
    if (!bypassWrapper.includes(ctx.path)) {
      ctx.type = 'json';
      ctx.body = await next();
      ctx.status = 200;
    } else {
      const aa = await next();
      return aa;
    }
  } catch (err) {
    ctx.status = err.statusCode || 500;
    ctx.body = {
      message: err.message
    };
  }
});


appKoa
  .use(router.routes())
  .use(router.allowedMethods());

export default appKoa;
