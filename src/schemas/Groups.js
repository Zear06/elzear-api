// @flow
import * as _ from 'lodash';
import ApiError from '../ApiError';
import Document from './Document';

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
  static saveTime = true;

  static saveGroup(payload): Promise<Group> {
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

    return this.save(data, { returnNew: true });
  }
}

export default Group;
