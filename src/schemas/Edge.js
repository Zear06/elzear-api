import { db } from '../arango';
import Document from './Document';
import ApiError from '../ApiError';

class Edge extends Document {
  document: Object;
  collectionName: string;
  title: string;
  from: string;
  to: string;

  static outEdgesByKey(key) {
    return this.outEdgesById(`${this.from}/${key}`);
  }

  static outEdgesById(id) {
    return this.edgeCollection().outEdges(id);
  }

  static inEdgesById(id) {
    return this.edgeCollection().inEdges(id);
  }

  static inEdgesByKey(key) {
    return this.inEdgesById(`${this.to}/${key}`);
  }

  static save(data: Object, fromId?: string, toId?: string) {
    if (this.saveTime) {
      const now = new Date();
      return this.edgeCollection().save({ createdAt: now, updatedAt: now, ...data }, fromId, toId);
    }
    return this.edgeCollection().save(data, fromId, toId);
  }

  static saveUsingKeys(data: Object, fromKey?: string, toKey?: string) {
    return this.save(data, `${this.from}/${fromKey}`, `${this.to}/${toKey}`)
  }

  static removeFromTo(from, to) {
    return this.edgeCollection()
      .removeByExample({ _from: `${this.from}/${from}`, _to: `${this.to}/${to}` })
      .then((resp) => {
        if (resp.deleted === 1) {
          return {};
        }
        throw new ApiError(404, `${this.title} not found`);
      });
  }

  static edgeCollection() {
    return db.edgeCollection(this.collectionName);
  }
}


export default Edge;
