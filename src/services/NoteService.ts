import NoteModel from "../models/NoteModel";
import UserModel from "../models/UserModel";
import { SentimentAnalysisModel } from '../models/SentimentAnalysisModel';
import mongoose from "mongoose";
import axios from 'axios';
import FormData from 'form-data';
import { io } from '../index';

// helper function to get sentiment analysis of note
async function analyzeSentiment(noteText: string) {
    const formData = new FormData();
    formData.append('key', process.env.SENTIMENT_API_KEY);
    formData.append('lang', 'en');
    formData.append('model', 'general');
    formData.append('txt', noteText);
    // make request using axios
    const response = await axios.post('https://api.meaningcloud.com/sentiment-2.1', formData, {
        headers: formData.getHeaders(),
    });
    // get data
    const sentimentData = response.data;
    // Create a new SentimentAnalysis
    const sentimentAnalysis = new SentimentAnalysisModel({
        overall_sentiment: sentimentData?.overall_sentiment,
        agreement: sentimentData?.agreement,
        subjectivity: sentimentData?.subjectivity,
        confidence: sentimentData?.confidence,
        irony: sentimentData?.irony,
        sentimented_entities: sentimentData?.sentimented_entity_list,
        sentimented_concepts: sentimentData?.sentimented_concept_list,
    });
    // save result to db
    await sentimentAnalysis.save();
    // return id of object for note reference
    return sentimentAnalysis._id;
}

// function to create a new note
export const addNote = async (record: { userId: mongoose.Types.ObjectId, title: string, body: string }) => {
    // Validate inputs
    if (!record.userId || !record.title || !record.body) {
        return null; // Return null if any argument is empty
    }
    // analyze sentiment and get the ID of the SentimentAnalysis 
    const sentimentAnalysisId = await analyzeSentiment(record.body);
    // create a new note 
    const newNote = new NoteModel({
        ...record,
        sentimentAnalysis: sentimentAnalysisId, // reference to the SentimentAnalysis
    });
    // save the new note to db
    const savedNote = await newNote.save();
    // update the user's lastNote field
    await UserModel.findByIdAndUpdate(record.userId, { lastCreatedNote: savedNote._id });
    // emit the new note to all connected clients. when creating client side, there should be event of socket.on('newNote',...)
    io.emit('newNote', newNote);
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
