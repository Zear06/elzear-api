import User from './User';
import ApiError from '../ApiError';
import Auth from './Auth';

class AuthFb extends Auth {
  static collectionName = 'auth_facebook';
  static title = 'authFacebook';

  static saveAuthFb(user, payload) {
    return this.save({
      _key: user._key,
      ...payload
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
      name: payload.displayName,
      masterAuth: 'facebook'
    }, { returnNew: true })
      .then(user => {
        return AuthFb.save({
          ...payload,
          _key: user.new._key
        })
          .then(() => Auth.userPlusAuths(user.new._key))
      });
  }

  static add(payload: Object, userToken) {
    const user = User.decode(userToken);
    return AuthFb.some({ id: payload.id })
      .then((isSome) => {
        if (isSome) {
          throw new ApiError(400, 'This facebook account is already used')
        }
        return AuthFb.saveAuthFb(user, payload)
          .then(authFb => Auth.userPlusAuths(user._key));
      });
  }
}

export default AuthFb;
