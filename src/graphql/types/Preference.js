import { GraphQLObjectType, GraphQLString } from 'graphql';
import { edgeFields, timestamped } from '../fields';
import userType from './User';
import groupType from './Group';

const preferenceType = new GraphQLObjectType({
  name: 'Preference',
  fields: () => ({
    ...edgeFields,
    ...timestamped,
    user: {
      type: userType,
      resolve: preference => ({ _id: preference._from })
    },
    poll: {
      type: groupType,
      resolve: preference => ({ _id: preference._to })
    },
    ranking: {
      type: GraphQLString,
      resolve: preference => {
        return JSON.stringify(preference.ranking);
      }
    }
  })
});

export default preferenceType;
