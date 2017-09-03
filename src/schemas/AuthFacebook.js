import User from './User';
import ApiError from '../ApiError';
import Auth from './Auth';

class AuthFb extends Auth {
  static collectionName = 'auth_facebook';
  static title = 'authFacebook';

  static saveAuthFb(user, payload) {
    const { data } = payload;
    const master = !!payload.master;
    return this.save({
      _key: user._key,
      ...data,
      master
    }, { returnNew: true })
      .catch(e => {
        throw new ApiError(400, null, e);
      });
  }

  static profile2User(payload) {
    return this.collection().firstExample({ id: payload.id })
      .then((authFb) => Auth.userPlusAuths(authFb._key))
  }

  static login(payload: Object): Promise<any> {
    return AuthFb.profile2User(payload);
  }


  static register(payload: Object): Promise<any> {
    return User.save({
      username: payload.displayName
    }, { returnNew: true })
      .then(user => {
        return this.save({
          ...payload,
          master: true,
          _key: user.new._key
        })
          .then(() => Auth.userPlusAuths(user.new._key))
      });
  }

  static add(payload: Object, userToken) {
    const user = User.decode(userToken);
    return AuthFb.saveAuthFb(user, payload)
      .then(authFb => Auth.userPlusAuths(user._key));
  }
}

export default AuthFb;
