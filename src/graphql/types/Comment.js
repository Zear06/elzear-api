import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { commentsField, edgeFields, timestamped } from '../fields';
import userType from './User';
import User from '../../schemas/User';

const commentType = new GraphQLObjectType({
  name: 'Comment',
  fields: () => ({
    ...edgeFields,
    ...timestamped,
    ...commentsField,
    text: {
      type: new GraphQLNonNull(GraphQLString)
    },
    author: {
      type: userType,
      resolve: ({ _from }) => {
        return User.collection().firstExample({ _id: _from });
      }
    },
  })
});

export default commentType;
