import Group from '../schemas/Groups';
import GroupUser from '../schemas/GroupUser';
import { apiArray } from './util';

function create(ctx, next) {
  return GroupUser.saveGroup(ctx.state.user, ctx.request.body);
}

function getAll(ctx, next) {
  return GroupUser.getVisible(ctx.state.user, ctx.request.body).then(apiArray)
}

function getMyGroups(ctx, next) {
  return GroupUser.getGroupsOf(ctx.state.user);
}

function get(ctx, next) {
  return Group.getFromKey(ctx.params.groupKey);
}

function patch(ctx, next) {
  return Group.patchByKey(ctx.params.groupKey, ctx.request.body);
}

function remove(ctx, next) {
  return Group.removeByKey(ctx.params.groupKey);
}

function putUser(ctx, next) {
  return GroupUser.saveUsingKeys(ctx.request.body, ctx.params.groupKey, ctx.params.userKey);
}

function patchUser(ctx, next) {
  return GroupUser.patchUser(ctx.params.groupKey, ctx.params.userKey, ctx.request.body);
}

function getUsers(ctx, next) {
  return Promise.all([
    GroupUser.getUsersOf(ctx.params.groupKey),
    GroupUser.some({ _from: ctx.params.groupKey, _to: ctx.state.user._key }),
  ]).then(([users, iAmIn]) => ({
    data: users,
    iAmIn
  }));
}

function removeUser(ctx, next) {
  return GroupUser.removeFromTo(ctx.params.groupKey, ctx.params.userKey);
}

export {
  create,
  get,
  getAll,
  getMyGroups,
  getUsers,
  patch,
  patchUser,
  putUser,
  remove,
  removeUser
}
