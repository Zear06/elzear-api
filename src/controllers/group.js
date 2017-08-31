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

export {
  create,
  getAll,
  getMyGroups
}
