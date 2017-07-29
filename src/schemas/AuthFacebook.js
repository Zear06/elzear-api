import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost/test');

const authFacebookSchema = mongoose.Schema({
  user_id: { type: mongoose.Schema.ObjectId, ref: 'User', required: true, unique: true },
  profile: { type: Object },
  id: { type: String, unique: true },
  token: String
});

const AuthFacebook = mongoose.model('AuthFacebook', authFacebookSchema);

export default AuthFacebook;

function getProfile(id) {
  return AuthFacebook.findOne({ id })
    .then(auth => (auth ? auth.profile : false));
}

export { getProfile };
