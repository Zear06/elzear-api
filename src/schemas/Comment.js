// @flow
import Edge from './Edge';

class Comment extends Edge {
  document: {
    _key: string,
    _id: string,
    name: string,
    updatedAt: string,
    createdAt: string
  };

  static from = 'users';
  static to = null;
  static collectionName = 'comments';
  static title = 'comment';
  static saveTime = true;

  static postCommentOn(user, { targetId, text }) {
    const fromId = `users/${user._key}`;
    return this.save({ text }, fromId, targetId);
  }
  static postCommentOnKey(user, { targetType, targetKey, text }) {
    const targetId = `targetType/${targetKey}`;
    return this.postCommentOn(user, { targetId, text });
  }
}

export default Comment;
