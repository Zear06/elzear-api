import Comment from '../schemas/Comment';
import CommentComment from '../schemas/CommentComment';
import CommentGroup from '../schemas/CommentGroup';
import CommentUser from '../schemas/CommentUser';
import { apiArray } from './util';

function get(ctx) {
  return Comment.getFromKey(ctx.params.commentKey);
}
function remove(ctx) {
  return Comment.removeByKey(ctx.params.commentKey);
}
function patch(ctx,) {
  return Comment.patchByKey(ctx.params.commentKey, ctx.request.body);
}

const commentPoints = (klass) => ({
  get: function (ctx) {
    return klass.inEdgesByKey(ctx.params.key).then(apiArray);
  },
  post: function (ctx) {
    return klass.saveUsingKeys(ctx.request.body, ctx.state.user._key, ctx.params.key)
  }
});
const comment = commentPoints(CommentComment);
const group = commentPoints(CommentGroup);
const user = commentPoints(CommentUser);

export {
  get,
  patch,
  remove,
  comment,
  group,
  user
}
