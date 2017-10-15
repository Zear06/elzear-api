import { GraphQLNonNull, GraphQLString, GraphQLList } from 'graphql';
import commentType from './types/Comment';
import Comment from '../schemas/Comment';
import type { arangoDoc } from '../schemas/Document';

const timestamped = {
  createdAt: {
    type: new GraphQLNonNull(GraphQLString)
  },
  updatedAt: {
    type: new GraphQLNonNull(GraphQLString)
  }
};

const documentFields = {
  _id: {
    type: new GraphQLNonNull(GraphQLString)
  },
  _key: {
    type: new GraphQLNonNull(GraphQLString)
  },
};

const edgeFields = {
  ...documentFields,
  _from: {
    type: new GraphQLNonNull(GraphQLString)
  },
  _to: {
    type: new GraphQLNonNull(GraphQLString)
  },
};

const commentsField = {
  comments: {
    type: new GraphQLList(commentType),
    resolve: (parent: arangoDoc) => {
      return Comment.inEdgesById(parent._id)
    }
  }
};

export {
  documentFields,
  edgeFields,
  timestamped,
  commentsField
};
