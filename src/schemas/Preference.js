import * as _ from 'lodash';
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
  if (!ranking || !Array.isArray(ranking) || !ranking.every(Array.isArray)) {
    throw new ApiError(400, 'invalid ranking');
  }
  const alternatives = _.flattenDepth(ranking, 2);
  if (_.uniq(alternatives).length !== alternatives.length) {
    throw new ApiError(400, 'Ranking cannot have duplicates');
  }
}

type PreferenceType = {
  _id: string,
  _key: string,
  ranking: Array<Array<string>>
}

const Preference = {
  ...edge,

  savePreferenceOnPoll(user, pollKey, ranking): Promise<PreferenceType> {
    validate(ranking);
    return this.collection().firstExample({ _from: user._id, _to: `polls/${pollKey}` })
      .then(pref => this.collection().update(pref._id, { ranking }, { returnNew: true }))
      .catch(() => this.save({ ranking }, user._id, `polls/${pollKey}`));
  },
};

export default Preference;
