import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import groupType from './Group';
import { documentFields, timestamped } from '../fields';
import authType from './Auth';
import User from '../../schemas/User';
import GroupUser from '../../schemas/GroupUser';

const userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    ...documentFields,
    ...timestamped,
    name: {
      type: new GraphQLNonNull(GraphQLString)
    },
    masterAuth: {
      type: new GraphQLNonNull(GraphQLString)
    },
    auths: {
      type: new GraphQLList(authType),
      resolve: user => User.auths(user._key)
    },
    friends: {
      type: new GraphQLList(userType)
    },
    groups: {
      type: new GraphQLList(groupType),
      resolve: user => {
        console.log('user', user);
        const groups = GroupUser.getGroupsOf(user);
        console.log('groups', groups);
        return groups;
      }
    }
  })
});

export default userType;
