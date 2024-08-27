import { Schema } from 'mongoose';

// schema for sentimented entities
const SentimentedEntitySchema = new Schema({
    form: { type: String },
    id: { type: String },
    type: { type: String },
});

// schema for sentimented concepts
const SentimentedConceptSchema = new Schema({
    form: { type: String },
    id: { type: String },
    type: { type: String },
});

// Sentiment analysis schema
const SentimentAnalysisSchema = new Schema({
    overall_sentiment: { type: String }, // Overall sentiment of the note
    agreement: { type: String },         // Agreement in sentiment analysis
    subjectivity: { type: String },      // Subjectivity of the note
    confidence: { type: Number },        // Confidence level of sentiment analysis
    irony: { type: String },             // Irony detection
    sentimented_entities: [SentimentedEntitySchema], // List of entities with sentiment
    sentimented_concepts: [SentimentedConceptSchema], // List of concepts with sentiment
}, { timestamps: true });

export default SentimentAnalysisSchema;