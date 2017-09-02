import { db } from '../arango';
import ApiError from '../ApiError';

type arangoDoc = {
  _key: string,
  _id: string
}

class Document {
  document: Object;
  collectionName: string;
  title: string;

  constructor(document) {
    if (new.target === Document) {
      throw new TypeError('Cannot construct Abstract instances directly');
    }
    this.document = document;
  }

  static collection() {
    return db.collection(this.collectionName);
  }

  static getFromKey(key): Promise<arangoDoc> {
    return this.collection().firstExample({ _key: key })
  }

  static getFromId(id): Promise<arangoDoc> {
    return this.collection().firstExample({ _id: id });
  }

  static removeByKey(key): Promise<arangoDoc> {
    return this.collection().removeByKeys([key]);
  }

  static save(data: any, opts?: any): Promise<any> {
    return this.collection().save(data, opts)
  }

  static patchByKey(key, payload): Promise<arangoDoc> {
    return this.collection()
      .updateByExample({ _key: key }, payload)
      .then((resp) => {
        if (resp.updated === 1) {
          return this.collection().firstExample({ _key: key })
        }
        throw new ApiError(404, `${this.title} not found`);
      });
  }
}

export default Document;
