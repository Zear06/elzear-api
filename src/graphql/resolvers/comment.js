import { GraphQLString, GraphQLFieldResolveFn } from 'graphql';
import secure from './secure';
import Comment from '../../schemas/Comment';
import commentType from '../types/Comment';

function fct(root, { targetId, text }, { req }) {
  return Comment.postCommentOn(req.user, { targetId, text })
    .then(comment => ({
      ...comment,
      _from: `users/${req.user._key}`,
      _to: targetId,
      text,
      createdAt: new Date()
    }));
}

const resolve: GraphQLFieldResolveFn = secure(fct);

const commentAdd = {
  type: commentType,
  args: {
    targetId: {
      type: GraphQLString
    },
    text: {
      type: GraphQLString
    }
  },
  resolve
};

export default commentAdd;
