// import required packages
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import http from 'http';
import cors from 'cors';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import { verifyToken } from './services/jwtUtils';
import { Request, Response, NextFunction } from 'express';
// import routings
import authRouter from './routes/auth';
import noteRouter from './routes/notes';
import subRouter from './routes/subscribe';
import userRouter from './routes/users';

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

// userId as property in requests
declare module 'express-serve-static-core' {
  interface Request {
      userId?: string;
  }
}

// define middleware for authentication of users
app.use(function (req: Request, res: Response, next: NextFunction) {
  //skip authentication for /auth routes
  if (req.path.startsWith('/auth')) {
    return next();
  }
  try {
    // get token from session
    const token = req.cookies.token;
    // try to verify user
    const userId = verifyToken(token);
    // if not verified, return error
    if (!userId) {
      return res.status(401).send({ message: 'Not authorized', success: false });
    }
    // if user verified, continue to next routing
    req.userId = userId;
    next();
  } catch(err) {
      console.error('Unexpected error:', err);
      res.status(500).send({ message: 'Internal server error', success: false });
  }
});

// routes definitions
app.use("/auth", authRouter);
app.use("/notes", noteRouter);
app.use("/subscribe", subRouter);
app.use("/users", userRouter);

// connect to mongodb
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// initialize server instance
const server = http.createServer(app);
// listen on port 3500
const port = process.env.PORT || 3500;
server.listen(port, () => {
    console.log("Server running on port:", port)
});