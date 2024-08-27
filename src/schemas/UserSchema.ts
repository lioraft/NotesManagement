import mongoose, { Schema } from 'mongoose';

// user schema - username is required and should be a unique string, password is a required string as well
// subscriptions is initialized to empty array
const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    lastCreatedNote: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', default: null },
  });

export default UserSchema;







  
