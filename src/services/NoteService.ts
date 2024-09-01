import NoteModel from "../models/NoteModel";
import UserModel from "../models/UserModel";
import { SentimentAnalysisModel } from '../models/SentimentAnalysisModel';
import mongoose from "mongoose";
import axios from 'axios';
import FormData from 'form-data';
import { io } from '../index';
import { ValidationError, NotFoundError } from '../error';

// helper function to validate MongoDB ObjectId
const isValidObjectId = (id: any): boolean => mongoose.Types.ObjectId.isValid(id);

// helper function to get sentiment analysis of note
export async function analyzeSentiment(noteText: string) {
    // if input not valid, throw validation error
    if (!noteText || typeof noteText !== 'string') {
        throw new ValidationError('Invalid note text');
    }
    // if no key, throw error
    const apiKey = process.env.SENTIMENT_API_KEY;
    if (!apiKey) {
        throw new Error('Sentiment API key is not set');
    }
    // prepare data for api request 
    const formData = new FormData();
    formData.append('key', apiKey);
    formData.append('lang', 'en');
    formData.append('model', 'general');
    formData.append('txt', noteText);
    // make request using axios
    try {
        const response = await axios.post('https://api.meaningcloud.com/sentiment-2.1', formData, {
            headers: formData.getHeaders(),
        });
        // get data
        const sentimentData = response.data;
        // Create a new SentimentAnalysis, saving relevant information
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
    } catch (error) {
        console.error('External API Error while analyzing sentiment:', error);
        throw new Error('Sentiment analysis failed');
    }
}

// function to create a new note
export const addNote = async (record: { userId: mongoose.Types.ObjectId, title: string, body: string }) => {
    // validate inputs
    if (!record.userId || !record.title || !record.body || !isValidObjectId(record.userId)) {
        throw new ValidationError('Missing required fields');
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
    const userUpdateResult = await UserModel.findByIdAndUpdate(record.userId, { lastCreatedNote: savedNote._id });
    // if user not found, throw error
    if (!userUpdateResult) {
        await NoteModel.findByIdAndDelete(savedNote._id); // delete the note if user is not found
        throw new NotFoundError('Invalid user ID');
    }
    // emit the new note to all connected clients. when creating client side, there should be event of socket.on('newNote',...)
    io.emit('newNote', newNote);
    // return the saved note object
    return savedNote.toObject();
};

// function to get all notes from users that the user is subscribed to, including the user's own notes
export const getNotes = async (userId: mongoose.Types.ObjectId) => {
    if (!userId || !isValidObjectId(userId)) {
        throw new ValidationError('Invalid user ID');
    }
    // find the user by ID and get their subscriptions (which are user IDs)
    const user = await UserModel.findById(userId).select('subscriptions').exec();
    // if user doesn't exist, return empty notes list
    if (!user) {
        throw new NotFoundError("User does not exist");
    }
    const userIdsToSearch = [userId]
    // combine user's own userId with the subscriptions
    if (Array.isArray(user.subscriptions)) {
        userIdsToSearch.push(...user.subscriptions);
    }
    // retrieve notes for the user and all subscribed users
    const notes = await NoteModel.find({ userId: { $in: userIdsToSearch } }).exec();
    return notes;
};

// function to get a specific note by its ID
export const getNoteById = async (noteId: mongoose.Types.ObjectId) => {
    // check note id is valid
    if (!noteId || !isValidObjectId(noteId)) {
        throw new ValidationError('Invalid note ID');
    }
    const note = await NoteModel.findById(noteId).exec();
    if (!note) {
        throw new NotFoundError('Note not found');
    }
    return note;
};
