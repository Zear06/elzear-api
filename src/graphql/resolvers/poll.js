import secure from './secure';
import { GraphQLBoolean, GraphQLString } from 'graphql';
import Poll from '../../schemas/Poll';
import pollType from '../types/Poll';
import Preference from '../../schemas/Preference';

function fctPollAdd(root, payload, { req }) {
  const { name, description, type } = payload;
  return Poll.savePoll(req.user, { name, description, type })
    .then(a => {
      console.log('a', a);
      return a;
    });
}
function fctPollAddOnGroup(root, payload, { req }) {
  const { name, description, type, groupKey } = payload;
  return Poll.savePollOnGroup(req.user, groupKey, { name, description, type });
}

const pollArgs = {
  name: {
    type: GraphQLString
  },
  description: {
    type: GraphQLString
  },
  type: {
    type: GraphQLString
  }
};

const pollAdd = {
  type: pollType,
  args: pollArgs,
  resolve: secure(fctPollAdd)
};
const pollAddOnGroup = {
  type: pollType,
  args: {
    groupKey: {
      type: GraphQLString
    },
    ...pollArgs
  },
  resolve: secure(fctPollAddOnGroup)
};

function fctPrefAdd(root, payload, { req }) {
  const { pollKey, ranking } = payload;
  return Preference.savePreferenceOnPoll(req.user, pollKey, JSON.parse(ranking));
}

const prefAdd = {
  type: GraphQLBoolean,
  args: {
    pollKey: {
      type: GraphQLString
    },
    ranking: {
      type: GraphQLString
    }
  },
  resolve: secure(fctPrefAdd)
};

export {
  pollAdd,
  pollAddOnGroup,
  prefAdd
};
