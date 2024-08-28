import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getUserByUsername, addUser, getUserProfile } from '../services/UserService';
//import { getUserNotes } from '../services/NoteService';
import { generateToken } from '../services/jwtUtils'
import mongoose from 'mongoose';

// create a router
const authRouter = Router();

// route of registering a new user
authRouter.post("/register", async (req, res) => {
    try {
        // get params from query's body
        const { username, password } = req.body;
        // validate fields
        if (!username || !password) {
            return res.status(400).send({ message: 'Username and password are required', success: false });
        }
        // try to find user in db
        const user = await getUserByUsername(username);
        // if user is found, throw error that username already exists
        if (user) {
            return res.status(409).send({ message: "Username taken", success: false });
        }
        // hash password
        const saltRounds = parseInt(process.env.bcrypt_saltRounds) || 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // record object to be passed to addUser
        const record = { username, password: hashedPassword };
        // create a new user
        const newUser = await addUser(record);
        // log creation of a new user to console
        console.log("A new user was created:", username)
        // success message
        return res.status(201).send({ message: 'User created', success: true, user: newUser});
    } catch (error) {
        console.error('Unexpected error while registering a user:', error);
        res.status(500).send({ message: 'Internal server error', success: false });
    }
});

// route of login of existing user
authRouter.post("/login", async (req, res) => {
try {
    // get username and password from body
    const { username, password } = req.body;
    // if input is invalid, return error message
    if (!username || !password) {
        return res.status(400).send({ message: 'Username and password are required', success: false });
    }
    // get user info from db
    const user = await getUserByUsername(username);
    // if user doesn't exist, return error
    if (!user) {
        return res.status(401).send({ message: 'Invalid username or password', success: false });
    }
    // check if saved hash password matches, if doesn't then return error
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(401).send({ message: 'Invalid username or password', success: false });
    }
    // generate token and return it in response
    const token = generateToken(user._id.toString());
    // set token as a cookie
    res.cookie('token', token, {
        httpOnly: true,  
        secure: process.env.NODE_ENV === 'production',  
        sameSite: 'strict',
    });
    // log successful login to console and return response
    console.log(username, " logged in");
    res.status(200).send({ message: 'Login successful', success: true });
} catch (error) {
    console.error('Unexpected error while login:', error);
    res.status(500).send({ message: 'Internal server error', success: false });
}
});

// Router to get user profile which consists of username, subscriptions and notes
authRouter.get('/profile', async (req, res) => {
    try {
      // get userid
      const userIdString = req.userId;
      if (userIdString) {
        // convert userIdString to objectId
        const userId = new mongoose.Types.ObjectId(userIdString);
        // retrieve the user profile
        const userProfile = await getUserProfile(userId);
        // log to console
        console.log("fetched profile of user:", userIdString);
        // return profile
        res.status(200).json({ success: true, user: userProfile });
      }
      else{
        res.status(400).json({ error: 'User ID not found in request' });
      }
    } catch (error) {
        console.log("Error while fetching user profile:", error)
        res.status(500).json({ success: false, message: 'Failed to retrieve user profile' });
    }
  });

// export the router
export default authRouter;