// @flow
import Document from './Document';
import Edge from './Edge';
import { getDb } from '../arango';


// document: {
//   _key: string,
//     _id: string,
//     name: string,
//     updatedAt: string,
//     createdAt: string
// };

const state = {
  from: 'users',
  to: null,
  collectionName: 'comments',
  title: 'comment',
  saveTime: true
};


const doc = Document(state);

type userType = {
  _key: string
};

const Comment = {
  ...doc,
  save(_data: Object, fromId?: string, toId?: string): { new: {} } {
    const data = { ..._data };
    if (state.saveTime) {
      const now = new Date();
      data.createdAt = now;
      data.updatedAt = now;
    }
    return this.collection()
      .save({ ...data, _from: fromId, _to: toId })
      .then(r => ({
        ...data,
        ...r,
        _from: fromId,
        _to: toId
      }));
  },

  inEdgesById(id: string) {
    return getDb().edgeCollection(state.collectionName).inEdges(id);
  },
  postCommentOn(user: userType, { targetId, text }: { targetId: string, text: string }) {
    const fromId = `users/${user._key}`;
    return this.save({ text }, fromId, targetId);
  }
};

export default Comment;
