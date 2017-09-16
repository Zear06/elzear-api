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
          return this.save({ type: 'admin' }, group.new._id, user._id)
            .then(() => group.new)
        }
      );
  }

  static editGroup(user, groupKey, payload): Promise<Group> {
    return Group.editGroup(groupKey, payload)
      .then((group) => group.new);
  }

  static read(user, key) {
    return Group.collection().firstExample({ _key: key })
      .then((group) => {
        if (group.read === 0) return group;
        if (group.read === 1 && user) return group;
        if (group.read === 2 && user && this.some({ _from: 'groups/' + key, _to: user._id })) return group;
        throw new ApiError(401, 'No access to this group');
      })
  }

  static list(user) {
    console.log('user', user);
    if (!user) {
      return Group.allPublic(false);
    }
    return Promise.all([
      GroupUser.inEdgesByKey(user._key),
      Group.allPublic(!!user._key)
    ])
      .then(([myMemberships, publicGroups]) => {
        let groups = [];
        const remainMemberships = [...myMemberships];
        for (const group of publicGroups) {
          const index = _.findIndex(remainMemberships, memberShip => memberShip._from === group._id);
          const iAmIn = index > -1 ? _.pullAt(remainMemberships, index)[0] : null;
          groups = [
            ...groups,
            {
              ...group,
              iAmIn
            }
          ];
        }
        if (remainMemberships.length === 0) {
          return groups;
        } else {
          return Promise.all(
            remainMemberships.map(
              (membership, key) => Group.getFromId(membership._from)
                .then(group => ({ ...group, iAmIn: remainMemberships[key] }))
            )
          )
            .then(hiddenGroups => [
              ...groups,
              ...hiddenGroups
            ])
        }
      })
  }

  static getGroupsOf(user) {
    return GroupUser.inEdgesByKey(user._key)
      .then(rows => Promise.all(
        rows.map(row => Group.getFromId(row._from))
      ))
  }

  static getUsersOf(group) {
    return GroupUser.outEdgesByKey(group._key)
      .then(rows => {
        return rows.map(
          row => ({
            _id: row._to,
            _key: row._to.split('/')[1]
          })
        )
      })
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
