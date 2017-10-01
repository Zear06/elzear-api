import Edge from './Edge';
import ApiError from '../ApiError';
import GroupUser from './GroupUser';
import { defaulRights } from './Groups';

const state = {
  to: 'groups',
  from: 'users',
  collectionName: 'polls',
  title: 'poll',
  saveTime: true
};

const pollTypes = ['majority'];

const edge = Edge(state);

function validate(payload) {

  if (!payload.type || !pollTypes.includes(payload.type)) {
    throw new ApiError(400, 'invalid poll type');
  }
  if (!payload.name || payload.name.length < 1) {
    throw new ApiError(400, 'Poll must have a name');
  }
}

const Poll = {
  ...edge,

  read(user, key) {
    return this.collection().firstExample({ _key: key })
  },
  savePoll(user, payload): Promise<Poll> {
    validate(payload);
    return GroupUser.saveGroup(user, { name: payload.name, type: 'oligarchy', actions: defaulRights })
      .then((group) => {
        return this.save(payload, user._id, group._id)
          .then(pollMeta => ({
            ...pollMeta,
            ...payload
          }))
      });
  },
  savePollOnGroup(user, groupKey, payload): Promise<Poll> {
    validate(payload);
    return this.save(payload, user._id, `groups/${groupKey}`)
    // .then(() => group.new);
  },
  list(user): Promise<Poll> {
    return this.collection().all()
      .then(polls => polls._result);
    // .then(() => group.new);
  },
};

export default Poll;
export { pollTypes };
