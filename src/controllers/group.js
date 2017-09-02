import { Group } from '../schemas/Groups';

function create(ctx, next) {
  return Group.save(ctx.state.user, ctx.request.body);
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
  return Group.putUser(ctx.params.groupKey, ctx.params.userKey, ctx.request.body);
}
function patchUser(ctx, next) {
  return Group.patchUser(ctx.params.groupKey, ctx.params.userKey, ctx.request.body);
}
function getUsers(ctx, next) {
  return Group.getUsers(ctx.params.groupKey);
}
function removeUser(ctx, next) {
  return Group.removeUser(ctx.params.groupKey, ctx.params.userKey);
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
