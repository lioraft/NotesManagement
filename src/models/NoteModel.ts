import mongoose from 'mongoose';
import NoteSchema from '../schemas/NoteSchema';

// Note model definition
const NoteModel = mongoose.model('Note', NoteSchema);

export default NoteModel;