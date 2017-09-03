import Edge from './Edge';

class GroupUser extends Edge {
  static from = 'groups';
  static to = 'users';
  static collectionName = 'groups_users';
  static title = 'groupMember';
}

export default GroupUser;
