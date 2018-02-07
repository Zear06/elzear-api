import * as _ from 'lodash';
import { aql } from 'arangojs';
import ApiError from '../ApiError';
import Document from './Document';
import { getDb } from '../arango';

const groupTypes = ['oligarchy'];


// 0 anon
// 1 user
// 2 mmbr
// 3 amin
// 4 noon

const possibleActions = {
  list: [0, 1, 2],
  read: [0, 1, 2],
  // rqst: [1, 2],
  // acpt: [1, 2, 3],
  // invt: [1, 2, 3],
  edit: [2, 3, 4],
  // revo: [3, 4]
};

const defaulRights = {
  revo: 4,
  invt: 3,
  rqst: 1,
  acpt: 1,
  list: 2,
  read: 0,
  edit: 3
};

function groupPayload(payload) {
  if (!_.has(payload, 'name') || payload.name.length < 1) {
    throw new ApiError(400, 'Group must have a name');
  }
  if (!_.has(payload, 'type') || !groupTypes.includes(payload.type)) {
    throw new ApiError(400, 'Group must have a type');
  }
  const actions = { ...defaulRights };
  // for (const action of Object.keys(possibleActions)) {
  //   if (!possibleActions[action].includes(payload.actions[action])) {
  //     throw new ApiError(400, 'Invalid action rights');
  //   }
  //   actions[action] = payload.actions[action];
  // }
  return {
    actions,
    name: payload.name,
    type: payload.type,
    description: payload.description
  };
}

// document: {
//   _key: string,
//     _id: string,
//     name: string,
//     description: string,
//     type: string,
//     list: 0 | 1 | 2,
//     read: 0 | 1 | 2,
//     rqst: 1 | 2,
//     acpt: 1 | 2 | 3,
//     invt: 1 | 2 | 3,
//     edit: 2 | 3 | 4,
//     revo: 3 | 4,
//     updatedAt: string,
//     createdAt: string
// };


const state = {
  collectionName: 'groups',
  title: 'group',
  saveTime: true
};

type GroupType = {
  _id: string,
  _key: string
};

const doc = Document(state);

const Group = {

  ...doc,
  all() {
    return this.collection().all()
      .then(groups => groups._result);
  },

  allPublic(isAuth) {
    const rank = isAuth ? 1 : 0;
    return getDb().query(aql`
    FOR group IN groups
    FILTER group.list <= ${rank}
    RETURN group
    `)
      .then(r => r._result);
  },


  editGroup(key, payload): Promise<{ new: GroupType }> {
    const newValues = groupPayload(payload);
    return this.collection().update({ _key: key }, {
      ...newValues,
      updatedAt: new Date()
    }, { returnNew: true });
  },

  saveGroup(payload) {
    const values = groupPayload(payload);

    const now = new Date();

    const data = {
      ...values,
      createdAt: now,
      updatedAt: now
    };
    return this.save(data, { returnNew: true });
  }
};

export default Group;
export { possibleActions, defaulRights };
