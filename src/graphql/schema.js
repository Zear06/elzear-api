import { GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import User from '../schemas/User';
import Group from '../schemas/Groups';
import userType from './types/User';
import groupType from './types/Group';
import commentType from './types/Comment';
import authLocalType from './types/AuthLocal';
import authFbType from './types/AuthFb';
import { userEdit } from './resolvers/user';
import { groupAdd } from './resolvers/group';

const schema = new GraphQLSchema({
  types: [authLocalType, authFbType],
  mutation: new GraphQLObjectType({
    name: 'Mutations',
    fields: {
      groupAdd,
      userEdit
    }
  }),
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      users: {
        type: new GraphQLList(userType),
        resolve: () => User.all()
      },
      user: {
        type: userType,
        args: {
          key: {
            description: 'Returns one user',
            type: GraphQLString
          }
        },
        resolve: (root, { key }) => User.collection().firstExample({ _key: key })
      },
      me: {
        type: userType,
        resolve: (root, args, { req }) => User.collection()
          .firstExample({ _key: req.user._key })
      },
      group: {
        type: groupType,
        args: {
          key: {
            description: 'Returns one group',
            type: GraphQLString
          }
        },
        resolve: (root, { key }) => Group.collection().firstExample({ _key: key })
      },
      groups: {
        type: new GraphQLList(groupType),
        resolve: (root, args, { req }) => {
          return Group.all();
        }
      },
      comments: {
        type: new GraphQLList(commentType),
        resolve: () => Comment.all()
      }
    }
  })
});

export default schema;
