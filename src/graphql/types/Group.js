import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import userType from './User';
import { documentFields, timestamped } from '../fields';

const groupType = new GraphQLObjectType({
  name: 'Group',
  fields: () => ({
    ...documentFields,
    ...timestamped,
    name: {
      type: new GraphQLNonNull(GraphQLString)
    },
    users: {
      type: new GraphQLList(userType)
    }
  })
});

export default groupType;
