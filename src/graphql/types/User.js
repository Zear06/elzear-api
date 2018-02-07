import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import groupType from './Group';
import { documentFields, timestamped } from '../fields';
import authType from './Auth';
import User from '../../schemas/User';
import GroupUser from '../../schemas/GroupUser';
import Auth from '../../schemas/Auth';

const userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    ...documentFields,
    ...timestamped,
    name: {
      type: new GraphQLNonNull(GraphQLString)
    },
    extra: {
      type: GraphQLString
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
      resolve: user => GroupUser.getGroupsOf(user)
    },
    token: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: user => Auth.toJwt(user)
    }
  })
});

export default userType;
