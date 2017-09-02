import { Group } from '../schemas/Groups';
import GroupUser from '../schemas/GroupUser';

function create(ctx, next) {
  return Group.saveGroup(ctx.state.user, ctx.request.body);
}
function getAll(ctx, next) {
  return Group.getVisible(ctx.state.user, ctx.request.body);
}
function getMyGroups(ctx, next) {
  return Group.getGroupsOf(ctx.state.user);
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
  return Group.patchUser(ctx.params.groupKey, ctx.params.userKey, ctx.request.body);
}
function getUsers(ctx, next) {
  return GroupUser.outEdgesByKey(ctx.params.groupKey);
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
