import json from 'koa-json';
import Koa from 'koa';
import logger from 'koa-logger';
import cors from 'koa-cors';
import bodyParserKoa from 'koa-bodyparser';
import session from 'koa-session';
import router from './router';
import passport from './controllers/auth/facebook';
import { sessionsSecretKey } from '../config.dev';

const appKoa = new Koa();

appKoa.keys = [sessionsSecretKey];
appKoa.use(json());
appKoa.use(logger());
appKoa.use(bodyParserKoa());
appKoa.use(cors());
appKoa.use(passport.initialize());
appKoa.use(session(appKoa));


appKoa
  .use(router.routes())
  .use(router.allowedMethods());

export default appKoa;
