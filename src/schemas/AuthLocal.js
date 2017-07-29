import mongoose from 'mongoose';

mongoose.createConnection('mongodb://localhost/test');

const authLocalSchema = mongoose.Schema({
  user_id: { type: mongoose.Schema.ObjectId, ref: 'User', required: true, unique: true },
  passwordHash: { type: String, required: true }
});

authLocalSchema.methods.getName = function getName() {
  return this.username;
};

const AuthLocal = mongoose.model('AuthLocal', authLocalSchema);

export default AuthLocal;

function getProfile(id) {
  return AuthLocal.findOne({ _id: id })
    .then(user => (user ? user.username : false));
}

export { getProfile };
