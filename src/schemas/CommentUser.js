// @flow
import Comment from './Comment';

class CommentUser extends Comment {
  static to = 'users';

  constructor(comment: Object) {
    super(comment);
  }
}

export default CommentUser;
