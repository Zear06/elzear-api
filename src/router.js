import Router from 'koa-router';
import koaJwt from 'koa-jwt';
import graphqlHTTP from 'koa-graphql';
import health from './controllers/health';
import { jwtSecret } from '../config.dev';
import {
  authLogin, authRegister, callback, authAdd, authPatch, setMaster, authDelete
} from './controllers/auth/index';
import ApiError from './ApiError';
import Auth from './schemas/Auth';
import schema from './graphql/schema';
import { printIntrospectionSchema, printSchema } from 'graphql';

const router = new Router();

function me(ctx) {
  return Auth.userPlusAuths(ctx.state.user._key);
}

async function checkAuthType(ctx, next) {
  const validAuths = ['local', 'facebook'];
  if (!validAuths.includes(ctx.params.authType)) {
    throw new ApiError(400, 'Invalid Auth Type');
  }
  return await next();
}

const bypassWrapper = ['/graphql'];
const noJson = ['/schema', '/printSchema', '/printIntrospectionSchema'];
['facebook'].forEach(source => {
  ['register', 'login', 'add'].forEach(type => {
    bypassWrapper.push(`/auth/${source}/${type}`);
    bypassWrapper.push(`/auth/${source}/${type}/callback`);
  })
});

router.use('/', async function (ctx, next) {
  try {
    if (bypassWrapper.includes(ctx.path)) {
      return await next();
    } else if (noJson.includes(ctx.path)) {
      ctx.body = await next();
      ctx.status = 200;
    } else {
      ctx.type = 'json';
      ctx.body = await next();
      ctx.status = 200;
    }
  } catch (err) {
    ctx.status = err.statusCode || 500;
    if (ctx.status === 500) {
      console.log('err', err);
    }
    ctx.body = {
      message: err.message
    };
  }
});
router.use('/graphql', async function (ctx, next) {
  try {
    const a = await next();
    return a;
  } catch (err) {
    console.log('err', err);
    throw err;
  }
});

router.use([
  '/users',
  '/me',
  '/auth/local/add',
  '/groups'
  // '/auth/:authType'
], koaJwt({ secret: jwtSecret }));

router.use('/auth/:authType', checkAuthType);

router.get('/me', me);
router.get('/health', health);

router.post('/auth/:authType/login', authLogin);
router.get('/auth/:authType/login', authLogin);
router.post('/auth/:authType/login/callback', callback('login'));
router.get('/auth/:authType/login/callback', callback('login'));
router.post('/auth/:authType/register', authRegister);
router.get('/auth/:authType/register', authRegister);
router.get('/auth/:authType/register/callback', callback('register'));
router.post('/auth/:authType/add', authAdd);
router.get('/auth/:authType/add', authAdd);
router.get('/auth/:authType/add/callback', callback('add'));

router.patch('/auth/:authType', koaJwt({ secret: jwtSecret }), authPatch);
router.put('/auth/:authType', koaJwt({ secret: jwtSecret }), setMaster);
router.delete('/auth/:authType', koaJwt({ secret: jwtSecret }), authDelete);

router.get('/schema', () => schema);
router.get('/printSchema', () => printSchema(schema));
router.get('/printIntrospectionSchema', () => printIntrospectionSchema(schema));

router.use('/graphql', koaJwt({
  secret: jwtSecret,
  credentialsRequired: false,
  userProperty: 'user',
  passthrough: true
}));

router.all('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));

export default router;
