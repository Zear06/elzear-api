import secure from './secure';
import { GraphQLString } from 'graphql';
import userType from '../types/User';
import Auth from '../../schemas/Auth';

function fct(root, { payload }, { req }) {
  const data = JSON.parse(payload);
  return Auth.userEdit(req.user, data);
}

const resolve = secure(fct);

const userEdit = {
  type: userType,
  args: {
    payload: {
      type: GraphQLString
    }
  },
  resolve
};

export {
  userEdit
};
