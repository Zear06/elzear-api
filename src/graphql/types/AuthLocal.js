import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { documentFields } from '../fields';
import authInterface from './Auth';

const authLocalType = new GraphQLObjectType({
  name: 'AuthLocal',
  fields: () => ({
    ...documentFields,
    type: {
      type: new GraphQLNonNull(GraphQLString)
    },
    username: {
      type: new GraphQLNonNull(GraphQLString)
    }
  }),
  interfaces: () => [ authInterface ]
});

export default authLocalType;
