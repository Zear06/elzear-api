// @flow
import * as _ from 'lodash';
import { get as getDb } from '../arango';
import ApiError from '../ApiError';

const groupTypes = ['oligarchy'];

class Group {
  _key: string;
  _id: string;
  name: string;
  updatedAt: string;
  createdAt: string;

  constructor(group: Object) {
    Object.assign(this, group);
  }

  static save(user, payload): Promise<Group> {
    console.log('payload', payload);

    if (!_.has(payload, 'name')) {
      throw new ApiError(400, 'Group must have a name');
    }
    if (!_.has(payload, 'type') || !groupTypes.includes(payload.type)) {
      throw new ApiError(400, 'Group must have a type');
    }

    const db = getDb();
    const now = new Date();
    const data = {
      name: payload.name,
      type: payload.type,
      public: !!payload.public,
      createdAt: now,
      updatedAt: now
    };

    return db.collection('groups')
      .save(data, { returnNew: true })
      .then((group) => db.edgeCollection('groups_users')
        .save({}, group.new._id, user._id)
        .then(() => group.new)
      );
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

  static getFromKey(key): Promise<Group> {
    return getDb().collection('groups').firstExample({ _key: key })
  }

  static getFromId(id): Promise<Group> {
    return getDb().collection('groups').firstExample({ _id: id });
  }
}

function usersGroupIds(user) {
  const db = getDb();
  return db.edgeCollection('groups_users').inEdges(user._id)
    .then(rows => Promise.all(
      rows.map(row => row._from)
    ));
}

function publicGroups() {
  const db = getDb();
  return db.edgeCollection('groups')
    .byExample({ public: true })
    .then(rows => rows.all());
}

export {
  Group
};
