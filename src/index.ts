// import required packages
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import http from 'http';
import path from 'path';
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
// import socket.io for web socket functionality
import { Server } from 'socket.io';


// initialize express instance
const app = express();

// initialize env
dotenv.config();

// use documentation on api-docs route
app.get("/api-docs",function(req, res)
{ 
  const filePath = path.join(__dirname, 'docs', 'index.html');
  res.sendFile(filePath);
});

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
    // skip authentication for specific routes
    const unprotectedPaths = ['/auth/login', '/auth/register'];
    if (unprotectedPaths.includes(req.path)) {
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
// setup of websocket server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// log connections to console
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// listen on port 3500
const port = process.env.PORT || 3500;
server.listen(port, () => {
    console.log("Server running on port:", port)
});

// export the io for using it in notes updates in real time
export { io };