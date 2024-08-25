// import required packages
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import http from 'http';
import cors from 'cors';

// initialize express instance
const app = express();

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
let port: number = 3500
server.listen(port, () => {
    console.log("Server running on port:", port)
})