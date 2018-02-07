import { getDb } from '../arango';
import ApiError from '../ApiError';

type arangoDoc = {
  _key: string,
  _id: string
}

type documentStateType = {
  collectionName: string,
  title: string,
  saveTime: boolean
};

const Document = (_state: documentStateType) => {
  const state = {
    ..._state,
    saveTime: Boolean(_state.saveTime)
  };

  return {
    collection() {
      return getDb().collection(state.collectionName);
    },

    some(example: any) {
      return this.collection().firstExample(example)
        .then(() => true, () => false);
    },

    getFromKey(key: string): Promise<arangoDoc> {
      return this.collection().firstExample({ _key: key });
    },

    getFromId(id: string): Promise<arangoDoc> {
      return this.collection().firstExample({ _id: id });
    },

    removeByKey(key: string): Promise<arangoDoc> {
      return this.collection().removeByKeys([key]);
    },

    save(data: any, opts?: any): Promise<any> {
      if (state.saveTime) {
        const now = new Date();
        return this.collection().save({ createdAt: now, updatedAt: now, ...data }, opts);
      }
      return this.collection().save(data, opts);
    },

    patchByKey(key: string, payload: {[string]: any}): Promise<arangoDoc> {
      return this.collection()
        .updateByExample({ _key: key }, payload)
        .then((resp) => {
          if (resp.updated === 1) {
            return this.collection().firstExample({ _key: key });
          }
          throw new ApiError(404, `${state.title} not found`);
        });
    }
  };
};

export default Document;
export type { documentStateType, arangoDoc };
