import { GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import User from '../schemas/User';
import GroupUser from '../schemas/GroupUser';
import Comment from '../schemas/Comment';
import Poll from '../schemas/Poll';
import userType from './types/User';
import groupType from './types/Group';
import commentType from './types/Comment';
import authLocalType from './types/AuthLocal';
import authFbType from './types/AuthFb';
import { me, userEdit } from './resolvers/user';
import { groupAdd, groupEdit, groupSelfAction } from './resolvers/group';
import { commentAdd } from './resolvers/comment';
import secure from './resolvers/secure';
import pollType from './types/Poll';
import { pollAdd, prefAdd } from './resolvers/poll';

const schema = new GraphQLSchema({
  types: [authLocalType, authFbType],
  mutation: new GraphQLObjectType({
    name: 'Mutations',
    fields: {
      pollAdd,
      prefAdd,
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
      poll: {
        type: pollType,
        args: {
          key: {
            description: 'Returns one poll',
            type: GraphQLString
          }
        },
        resolve: (root, { key }, { req }) => Poll.read(req.user, key)
      },
      polls: {
        type: new GraphQLList(pollType),
        resolve: (root, args, { req }) => {
          return Poll.list(req.user);
        }
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
