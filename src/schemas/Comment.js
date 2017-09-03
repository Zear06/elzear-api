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

  constructor(comment: Object) {
    super(comment);
  }
}

export default Comment;
