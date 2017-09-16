import { GraphQLObjectType, GraphQLString } from 'graphql';
import { edgeFields, timestamped } from '../fields';
import GroupUser from '../../schemas/GroupUser';
import userType from './User';
import groupType from './Group';

const groupUserType = new GraphQLObjectType({
  name: 'GroupUser',
  fields: () => ({
    ...edgeFields,
    ...timestamped,
    type: {
      type: GraphQLString
    },
    user: {
      type: userType,
      resolve: groupUser => ({ _id: groupUser._to })
    },
    group: {
      type: groupType,
      resolve: groupUser => ({ _id: groupUser._from })
    }
  })
});

export default groupUserType;
