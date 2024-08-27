import mongoose from 'mongoose';
import SentimentAnalysisSchema from '../schemas/SentimentAnalysisSchema';

export const SentimentAnalysisModel = mongoose.model('SentimentAnalysis', SentimentAnalysisSchema);