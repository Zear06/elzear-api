import secure from './secure';
import { GraphQLString } from 'graphql';
import userType from '../types/User';
import Auth from '../../schemas/Auth';
import User from '../../schemas/User';

function fctEdit(root, { payload }, { req }) {
  const data = JSON.parse(payload);
  return Auth.userEdit(req.user, data);
}
const userEdit = {
  type: userType,
  args: {
    payload: {
      type: GraphQLString
    }
  },
  resolve: secure(fctEdit)
};

function fctMe(root, args, { req }) {
  return User.collection()
    .firstExample({ _key: req.user._key });
}
const me = {
  type: userType,
    resolve: secure(fctMe)
};

export {
  userEdit,
  me
};
