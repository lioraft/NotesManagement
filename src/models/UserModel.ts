import mongoose from 'mongoose';
import UserSchema from '../schemas/UserSchema';

// user model definition
const UserModel = mongoose.model('User', UserSchema);

export default UserModel;