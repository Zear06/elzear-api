import { GraphQLObjectType, GraphQLString, GraphQLList } from 'graphql';
import { commentsField, edgeFields, timestamped } from '../fields';
import userType from './User';
import groupType from './Group';
import Preference from '../../schemas/Preference';
import User from '../../schemas/User';
import Group from '../../schemas/Groups';
import preferenceType from './Preference';

const pollType = new GraphQLObjectType({
  name: 'Poll',
  fields: () => ({
    ...edgeFields,
    ...timestamped,
    ...commentsField,
    type: {
      type: GraphQLString
    },
    name: {
      type: GraphQLString
    },
    description: {
      type: GraphQLString
    },
    user: {
      type: userType,
      resolve: ({ _from }) => {
        return User.collection().firstExample({ _id: _from });
      }
    },
    group: {
      type: groupType,
      resolve: ({ _to }) => {
        return Group.collection().firstExample({ _id: _to });
      }
    },
    preferences: {
      type: new GraphQLList(preferenceType),
      resolve:  poll => Preference.inEdgesByKey(poll._key)
    }
  })
});

export default pollType;
