import NoteModel from "../models/NoteModel";
import UserModel from "../models/UserModel";
import mongoose from "mongoose";

// function to create a new note
export const addNote = async (record: { userId: mongoose.Types.ObjectId, title: string, body: string }) => {
    // TO DO: GET ANALYSIS FROM SENTIMENT API // 
    
    // create a new note 
    const newNote = new NoteModel(record);
    // save the new note to db
    const savedNote = await newNote.save();
    // return the saved note object
    return savedNote.toObject();
};

// function to get all notes from users that the user is subscribed to, including the user's own notes
export const getNotes = async (userId: mongoose.Types.ObjectId) => {
    try {
        // find the user by ID and get their subscriptions (which are user IDs)
        const user = await UserModel.findById(userId).select('subscriptions').exec();
        // if user doesn't exist, return empty notes list
        if (!user) {
            console.log('User not found:', userId);
            return [];
        }
        const userIdsToSearch = [userId]
        // combine user's own userId with the subscriptions
        if (Array.isArray(user.subscriptions)) {
            userIdsToSearch.push(...user.subscriptions);
        }
        // retrieve notes for the user and all subscribed users
        const notes = await NoteModel.find({ userId: { $in: userIdsToSearch } }).exec();
        return notes;
    } catch (error) {
        console.error('Error retrieving notes:', error);
        throw error;
    }
};

// function to get a specific note by its ID
export const getNoteById = async (noteId: mongoose.Types.ObjectId) => {
    // find the note by its ID
    const note = await NoteModel.findById(noteId).exec();
    if (!note) {
        console.log('Note not found:', noteId);
        return null;
    }
    return note;
};