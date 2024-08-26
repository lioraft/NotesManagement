// import required packages
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import http from 'http';
import cors from 'cors';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

// initialize express instance
const app = express();

// initialize env
dotenv.config();

// use cors for cross origins
app.use(cors({
    credentials: true
}));

// use parsers of cookies and json for body
app.use(cookieParser());
app.use(bodyParser.json());

// initialize server instance
const server = http.createServer(app);
// listen on port 3500
const port = process.env.PORT || 3500;
server.listen(port, () => {
    console.log("Server running on port:", port)
})

// get url from .env file
const mongoUrl = process.env.MONGO_URL;
// connect to mongodb
mongoose.connect(mongoUrl)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });