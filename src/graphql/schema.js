import { GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import User from '../schemas/User';
import GroupUser from '../schemas/GroupUser';
import Comment from '../schemas/Comment';
import userType from './types/User';
import groupType from './types/Group';
import commentType from './types/Comment';
import authLocalType from './types/AuthLocal';
import authFbType from './types/AuthFb';
import { me, userEdit } from './resolvers/user';
import { groupAdd, groupEdit, groupSelfAction } from './resolvers/group';
import { commentAdd } from './resolvers/comment';
import secure from './resolvers/secure';

const schema = new GraphQLSchema({
  types: [authLocalType, authFbType],
  mutation: new GraphQLObjectType({
    name: 'Mutations',
    fields: {
      groupAdd,
      groupEdit,
      userEdit,
      commentAdd,
      groupSelfAction
    }
  }),
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      users: {
        type: new GraphQLList(userType),
        resolve: secure(() => User.all())
      },
      user: {
        type: userType,
        args: {
          key: {
            description: 'Returns one user',
            type: GraphQLString
          }
        },
        resolve: secure((root, { key }) => User.collection().firstExample({ _key: key }))
      },
      me,
      group: {
        type: groupType,
        args: {
          key: {
            description: 'Returns one group',
            type: GraphQLString
          }
        },
        resolve: (root, { key }, { req }) => GroupUser.read(req.user, key)
      },
      groups: {
        type: new GraphQLList(groupType),
        resolve: (root, args, { req }) => {
          return GroupUser.list(req.user);
        }
      },
      comments: {
        type: new GraphQLList(commentType),
        args: {
          targetId: {
            description: 'Returns comments of the element',
            type: GraphQLString
          }
        },
        resolve: (root, { targetId }) => Comment.inEdgesById(targetId)
      }
    }
  })
});

export default schema;
