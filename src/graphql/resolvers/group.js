import secure from './secure';
import { GraphQLString } from 'graphql';
import groupType from '../types/Group';
import GroupUser from '../../schemas/GroupUser';

function fct(root, { name, description }, { req }) {
  return GroupUser.saveGroup(req.user, { name, description, type: 'oligarchy' });
}

const resolve = secure(fct);

const groupAdd = {
  type: groupType,
  args: {
    name: {
      type: GraphQLString
    },
    description: {
      type: GraphQLString
    }
  },
  resolve
};

export {
  groupAdd
};
