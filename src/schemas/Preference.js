import Edge from './Edge';
import ApiError from '../ApiError';

const state = {
  to: 'polls',
  from: 'users',
  collectionName: 'preferences',
  title: 'preference',
  saveTime: true
};

const edge = Edge(state);

function validate(ranking) {
  if (!ranking) {
    throw new ApiError(400, 'invalid ranking');
  }
}

type PreferenceType = {
  _id: string,
  _key: string
}

const Preference = {
  ...edge,

  savePreferenceOnPoll(user, pollKey, ranking): Promise<PreferenceType> {
    validate(ranking);
    return this.save({ ranking }, user._id, `polls/${pollKey}`);
  },
};

export default Preference;
