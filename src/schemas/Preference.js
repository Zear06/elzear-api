import Edge from './Edge';
import ApiError from '../ApiError';

const state = {
  to: 'polls',
  from: 'users',
  collectionName: 'preferences',
  title: 'preference'
};

const edge = Edge(state);

function validate(ranking) {
  if (!ranking) {
    throw new ApiError(400, 'invalid ranking');
  }
}

const Preference = {
  ...edge,

  savePreferenceOnPoll(user, pollKey, ranking): Promise<Preference> {
    validate(ranking);
    return this.save({ ranking }, user._id, `polls/${pollKey}`);
  },
};

export default Preference;
