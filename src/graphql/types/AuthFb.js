import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { documentFields } from '../fields';
import authInterface from './Auth';

const authFbType = new GraphQLObjectType({
  name: 'AuthFb',
  fields: () => ({
    ...documentFields,
    type: {
      type: new GraphQLNonNull(GraphQLString)
    }
  }),
  interfaces: () => [ authInterface ]
});

export default authFbType;
