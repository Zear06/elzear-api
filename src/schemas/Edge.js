import { db } from '../arango';
import Document from './Document';
import ApiError from '../ApiError';


type edgeStateType = {
  document: Object,
  collectionName: string,
  title: string,
  from: string,
  to: string
};

const Edge = (_state: edgeStateType) => {
  const state = {
    ..._state,
    saveTime: Boolean(_state.saveTime)
  };

  const doc = Document(state);

  return {
    ...doc,
    outEdgesByKey(key) {
      return this.outEdgesById(`${state.from}/${key}`);
    },

    outEdgesById(id) {
      return this.edgeCollection().outEdges(id);
    },

    inEdgesById(id) {
      return this.edgeCollection().inEdges(id);
    },

    inEdgesByKey(key) {
      return this.inEdgesById(`${state.to}/${key}`);
    },

    save(data: Object, fromId?: string, toId?: string) {
      if (state.saveTime) {
        const now = new Date();
        return this.edgeCollection().save({ createdAt: now, updatedAt: now, ...data }, fromId, toId);
      }
      return this.edgeCollection().save(data, fromId, toId);
    },

    saveUsingKeys(data: Object, fromKey?: string, toKey?: string) {
      return this.save(data, `${state.from}/${fromKey}`, `${state.to}/${toKey}`)
    },

    removeFromTo(from, to) {
      return this.edgeCollection()
        .removeByExample({ _from: `${state.from}/${from}`, _to: `${state.to}/${to}` })
        .then((resp) => {
          if (resp.deleted === 1) {
            return {};
          }
          throw new ApiError(404, `${state.title} not found`);
        });
    },

    edgeCollection() {
      return db.edgeCollection(state.collectionName);
    }
  }
};


export default Edge;
