// @flow
import * as _ from 'lodash';
import { db } from '../arango';
import ApiError from '../ApiError';
import Document from './Document';
import GroupUser from './GroupUser';

const groupTypes = ['oligarchy'];

class Group extends Document {
  document: {
    _key: string,
    _id: string,
    name: string,
    updatedAt: string,
    createdAt: string
  };

  static collectionName = 'groups';
  static title = 'group';

  constructor(group: Object) {
    super(group);
  }

  static saveGroup(user, payload): Promise<Group> {
    if (!_.has(payload, 'name')) {
      throw new ApiError(400, 'Group must have a name');
    }
    if (!_.has(payload, 'type') || !groupTypes.includes(payload.type)) {
      throw new ApiError(400, 'Group must have a type');
    }

    const now = new Date();
    const data = {
      name: payload.name,
      type: payload.type,
      public: !!payload.public,
      createdAt: now,
      updatedAt: now
    };

    return this.save(data, { returnNew: true })
      .then((group) => {
          return GroupUser.save({}, group.new._id, user._id)
            .then(() => group.new)
        }
      );
  }

  static patchUser(groupKey, userKey, payload = {}) {
    return db.edgeCollection('groups_users')
      .updateByExample({ _from: `groups/${groupKey}`, _to: `users/${userKey}` }, payload)
      .then((resp) => {
        if (resp.updated === 1) {
          return db.edgeCollection('groups_users').firstExample({
            _from: `groups/${groupKey}`,
            _to: `users/${userKey}`
          })
        }
        throw new ApiError(404, 'Member not found');
      });
  }

  static getVisible(user) {
    return Promise.all([this.getGroupsOf(user), publicGroups()])
      .then((groups) => _.uniqBy(
        [...groups[0], ...groups[1]], group => group._key
      ));
  }

  static getGroupsOf(user) {
    return usersGroupIds(user)
      .then(groupIds => Promise.all(
        groupIds.map(groupId => Group.getFromId(groupId))
      ))
  }
}

function usersGroupIds(user) {
  return GroupUser.inEdgesByKey(user._key)
    .then(rows => Promise.all(
      rows.map(row => row._from)
    ));
}

function publicGroups() {
  return db.collection('groups')
    .byExample({ public: true })
    .then(rows => rows.all());
}

export {
  Group
};
