import secure from './secure';
import { GraphQLInt, GraphQLString } from 'graphql';
import groupType from '../types/Group';
import GroupUser from '../../schemas/GroupUser';
import { possibleActions } from '../../schemas/Groups';
import groupUserType from '../types/GroupUser';
import ApiError from '../../ApiError';

const actions = {};
for (const action of Object.keys(possibleActions)) {
  actions[action] = { type: GraphQLInt };
}

function fctGroupAdd(root, payload, { req }) {
  const { name, description, type } = payload;
  const actionsValues = {};
  for (const action of Object.keys(possibleActions)) {
    actionsValues[action] = payload[action];
  }
  return GroupUser.saveGroup(req.user, { name, description, type, ...actionsValues });
}

const groupAdd = {
  type: groupType,
  args: {
    name: {
      type: GraphQLString
    },
    description: {
      type: GraphQLString
    },
    type: {
      type: GraphQLString
    },
    ...actions
  },
  resolve: secure(fctGroupAdd)
};
function fctGroupEdit(root, payload, { req }) {
  const { name, description, type, groupKey } = payload;
  const actionsValues = {};
  for (const action of Object.keys(possibleActions)) {
    actionsValues[action] = payload[action];
  }
  return GroupUser.editGroup(req.user, groupKey, { name, description, type, ...actionsValues });
}

const groupEdit = {
  type: groupType,
  args: {
    groupKey: {
      type: GraphQLString
    },
    name: {
      type: GraphQLString
    },
    description: {
      type: GraphQLString
    },
    type: {
      type: GraphQLString
    },
    ...actions
  },
  resolve: secure(fctGroupEdit)
};

function fctGroupSelfAction(root, { groupKey, action }, { req }) {
  if (action === 'join') {
    return GroupUser.save({ type: 'member' }, `groups/${groupKey}`, req.user._id);
  }
  if (action === 'quit') {
    return GroupUser.removeFromTo(groupKey, req.user._key);
  }
  throw new ApiError(400, 'Invalid action');
}

// join, quit
const groupSelfAction = {
  type: groupUserType,
  args: {
    groupKey: {
      type: GraphQLString
    },
    action: {
      type: GraphQLString
    }
  },
  resolve: secure(fctGroupSelfAction)
};

export {
  groupAdd,
  groupEdit,
  groupSelfAction
};
