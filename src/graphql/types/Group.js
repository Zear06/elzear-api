import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString, GraphQLInt } from 'graphql';
import * as _ from 'lodash';
import userType from './User';
import { commentsField, documentFields, timestamped } from '../fields';
import { possibleActions } from '../../schemas/Groups';
import GroupUser from '../../schemas/GroupUser';
import groupUserType from './GroupUser';

const actions = {};
for (const action of Object.keys(possibleActions)) {
  actions[action] = { type: GraphQLInt };
}

const groupType = new GraphQLObjectType({
  name: 'Group',
  fields: () => ({
    ...documentFields,
    ...timestamped,
    ...commentsField,
    ...actions,
    iAmIn: {
      type: groupUserType,
      resolve: (group, args, { req }) => {
        if (_.has(group, 'iAmIn')) return group.iAmIn;
        return GroupUser.collection()
          .firstExample({ _from: group._id, _to: req.user._id })
          .catch(() => null)
      }
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
    },
    description: {
      type: GraphQLString
    },
    users: {
      type: new GraphQLList(userType),
      resolve: (group) => GroupUser.getUsersOf(group)
    },
    groupUsers: {
      type: new GraphQLList(groupUserType),
      resolve: (group) => GroupUser.outEdgesByKey(group._key)
    },
    type: {
      type: new GraphQLNonNull(GraphQLString)
    }
  })
});

export default groupType;
