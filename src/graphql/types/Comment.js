import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { edgeFields, timestamped } from '../fields';

const commentType = new GraphQLObjectType({
  name: 'Comment',
  fields: () => ({
    ...edgeFields,
    ...timestamped,
    text: {
      type: new GraphQLNonNull(GraphQLString)
    },
    comments: {
      type: new GraphQLList(commentType)
    },
  })
});

export default commentType;
