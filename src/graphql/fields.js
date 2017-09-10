import { GraphQLNonNull, GraphQLString } from 'graphql';

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

export {
  documentFields,
  edgeFields,
  timestamped
};