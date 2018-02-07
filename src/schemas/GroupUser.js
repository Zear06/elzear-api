import * as _ from 'lodash';
import Edge from './Edge';
import Group from './Groups';
import ApiError from '../ApiError';
import User from './User';


function getPublicGroups() {
  return Group.collection()
    .byExample({ public: true })
    .then(rows => rows.all());
}

const state = {
  from: 'users',
  to: 'groups',
  collectionName: 'groups_users',
  title: 'groupMember',
  saveTime: true
};

type GroupType = {
  _id: string,
  _key: string
}

const edge = Edge(state);

const GroupUser = {
  ...edge,
  saveGroup(user, payload): Promise<GroupType> {
    return Group.saveGroup(payload)
      .then(group => this.save({ type: 'admin' }, user._id, group.new._id)
        .then(() => group.new));
  },

  editGroup(user, groupKey, payload): Promise<GroupType> {
    return Group.editGroup(groupKey, payload)
      .then(group => group.new);
  },

  read(user, key) {
    return Group.collection().firstExample({ _key: key });
  },

  list(user) {
    if (!user) {
      return Group.allPublic(false);
    }
    return Promise.all([
      GroupUser.outEdgesByKey(user._key),
      Group.allPublic(!!user._key)
    ])
      .then(([myMemberships, publicGroups]) => {
        const remainMemberships = [...myMemberships];
        const groups = publicGroups.map((group) => {
          const index = _.findIndex(remainMemberships, memberShip => memberShip._to === group._id);
          const iAmIn = index > -1 ? _.pullAt(remainMemberships, index)[0] : null;
          return {
            ...group,
            iAmIn
          };
        });
        if (remainMemberships.length === 0) {
          return groups;
        }
        return Promise.all(remainMemberships
          .map((membership, key) => Group
            .getFromId(membership._to)
            .then(group => ({ ...group, iAmIn: remainMemberships[key] }))))
          .then(hiddenGroups => [
            ...groups,
            ...hiddenGroups
          ]);
      });
  },

  getGroupsOf(user) {
    return GroupUser.outEdgesByKey(user._key)
      .then(rows => Promise.all(rows.map(row => Group.getFromId(row._to))));
  },

  getUsersOf(group) {
    return GroupUser.inEdgesByKey(group._key)
      .then(rows => rows.map(row => ({
        _id: row._from,
        _key: row._from.split('/')[1]
      })))
      .then(rows => Promise.all(rows.map(row => User.getFromId(row._from))));
  },

  getVisible(user) {
    return Promise.all([this.getGroupsOf(user), getPublicGroups()])
      .then(groups => _.uniqBy([...groups[0], ...groups[1]], group => group._key));
  },

  patchUser(groupKey, userKey, payload = {}) {
    return this.collection()
      .updateByExample({ _to: `groups/${groupKey}`, _from: `users/${userKey}` }, payload)
      .then((resp) => {
        if (resp.updated === 1) {
          return this.collection().firstExample({
            _to: `groups/${groupKey}`,
            _from: `users/${userKey}`
          });
        }
        throw new ApiError(404, 'Member not found');
      });
  }
};

export default GroupUser;
