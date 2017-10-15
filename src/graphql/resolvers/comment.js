import secure from './secure';
import { GraphQLString, GraphQLFieldResolveFn } from 'graphql';

import Comment from '../../schemas/Comment';
import commentType from '../types/Comment';

function fct(root, { targetId, text }, { req }) {
  return Comment.postCommentOn(req.user, { targetId, text })
    .then(comment => {
      return {
        ...comment,
        _from: 'users/' + req.user._key,
        _to: targetId,
        text,
        createdAt: new Date()
      };
    });
}

const resolve : GraphQLFieldResolveFn = secure(fct);

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

export {
  commentAdd
};
