import Edge from './Edge';
import Group from './Groups';
import * as _ from 'lodash';
import ApiError from '../ApiError';
import User from './User';

class GroupUser extends Edge {
  static from = 'groups';
  static to = 'users';
  static collectionName = 'groups_users';
  static title = 'groupMember';

  static saveGroup(user, payload): Promise<Group> {
    return Group.saveGroup(payload)
      .then((group) => {
          return this.save({}, group.new._id, user._id)
            .then(() => group.new)
        }
      );
  }

  static getGroupsOf(user) {
    return GroupUser.inEdgesByKey(user._key)
      .then(rows => Promise.all(
        rows.map(row => Group.getFromId(row._from))
      ))
  }

  static getUsersOf(group) {
    return GroupUser.outEdgesByKey(group._key)
      .then(rows => Promise.all(
        rows.map(row => User.getFromId(row._to))
      ))
  }

  static getVisible(user) {
    return Promise.all([this.getGroupsOf(user), publicGroups()])
      .then((groups) => _.uniqBy(
        [...groups[0], ...groups[1]], group => group._key
      ));
  }

  static patchUser(groupKey, userKey, payload = {}) {
    return this.collection()
      .updateByExample({ _from: `groups/${groupKey}`, _to: `users/${userKey}` }, payload)
      .then((resp) => {
        if (resp.updated === 1) {
          return this.collection().firstExample({
            _from: `groups/${groupKey}`,
            _to: `users/${userKey}`
          })
        }
        throw new ApiError(404, 'Member not found');
      });
  }
}

function publicGroups() {
  return Group.collection()
    .byExample({ public: true })
    .then(rows => rows.all());
}

export default GroupUser;
