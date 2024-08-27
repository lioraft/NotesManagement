import mongoose, { Schema } from 'mongoose';

// note scheme, includes: userId, which is the _id of user who created the note, title and body of the note, and the timestamp of creation of the note
const NoteSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // reference to user
    title: { type: String, required: true },
    body: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    sentiments: [
        {
            sentiment: { type: String },
            confidence: { type: Number },
        },
    ],
});

export default NoteSchema;

