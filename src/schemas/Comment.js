// @flow
import Edge from './Edge';


// document: {
//   _key: string,
//     _id: string,
//     name: string,
//     updatedAt: string,
//     createdAt: string
// };

const state = {
  from: 'users',
  to: null,
  collectionName: 'comments',
  title: 'comment',
  saveTime: true
};

const edge = Edge(state);
const Comment = {

  ...edge,
  postCommentOn(user, { targetId, text }) {
    const fromId = `users/${user._key}`;
    return this.save({ text }, fromId, targetId);
  },
  postCommentOnKey(user, { targetType, targetKey, text }) {
    const targetId = `targetType/${targetKey}`;
    return this.postCommentOn(user, { targetId, text });
  }
}

export default Comment;
