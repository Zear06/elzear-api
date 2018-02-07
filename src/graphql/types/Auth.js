import { GraphQLInterfaceType, GraphQLNonNull, GraphQLString } from 'graphql';
import authLocalType from './AuthLocal';
import { documentFields } from '../fields';
import authFbType from './AuthFb';

const authInterface = new GraphQLInterfaceType({
  name: 'Auth',
  types: [authLocalType],
  fields: () => ({
    ...documentFields,
    type: {
      type: new GraphQLNonNull(GraphQLString)
    }
  }),
  resolveType(auth) {
    if (auth.type === 'local') {
      return authLocalType;
    }
    if (auth.type === 'facebook') {
      return authFbType;
    }
    throw new Error('invalid auth');
  }
});

export default authInterface;
