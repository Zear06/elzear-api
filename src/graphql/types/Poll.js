import { GraphQLObjectType, GraphQLString, GraphQLList } from 'graphql';
import { commentsField, edgeFields, timestamped } from '../fields';
import userType from './User';
import groupType from './Group';
import Preference from '../../schemas/Preference';
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
      resolve: poll => ({ _id: poll._from })
    },
    group: {
      type: groupType,
      resolve: poll => ({ _id: poll._to })
    },
    preferences: {
      type: new GraphQLList(preferenceType),
      resolve:  poll => Preference.inEdgesByKey(poll._key)
    }
  })
});

export default pollType;
