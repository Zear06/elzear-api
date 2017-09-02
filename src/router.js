import Router from 'koa-router';
import koaJwt from 'koa-jwt';
import health from './controllers/health';
import { jwtSecret } from '../config.dev';
import {
  authLogin, authRegister, callback,
  addCallback, authAdd, authPatch, setMaster, authDelete
} from './controllers/auth/index';
import ApiError from './ApiError';
import * as group from './controllers/group';
import * as user from './controllers/user';
import Auth from './schemas/Auth';

const router = new Router();


router.use([
  '/users',
  '/me',
  '/auth/local/add',
  '/groups'
  // '/auth/:authType'
], koaJwt({ secret: jwtSecret }));

function me(ctx) {
  return Auth.userPlusAuths(ctx.state.user._key);
}

async function checkAuthType (ctx, next) {
  const validAuths = ['local', 'facebook'];
  if (!validAuths.includes(ctx.params.authType)) {
    throw new ApiError(400, 'Invalid Auth Type');
  }
  return await next();
}

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

router.get('/users', user.getAll);

router.post('/groups', group.create);
router.get('/groups', group.getAll);
router.get('/groups/mine', group.getMyGroups);
router.get('/groups/:groupKey', group.get);
router.patch('/groups/:groupKey', group.patch);
router.del('/groups/:groupKey', group.remove);
router.get('/groups/:groupKey/users', group.getUsers);
router.put('/groups/:groupKey/users/:userKey', group.putUser);
router.patch('/groups/:groupKey/users/:userKey', group.patchUser);
router.del('/groups/:groupKey/users/:userKey', group.removeUser);

export default router;
