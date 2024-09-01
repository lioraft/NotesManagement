import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getUserByUsername, addUser, getUserProfile } from '../services/UserService';
import { NotFoundError } from '../error';
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
            return res.status(400).json({ message: 'Username and password are required', success: false });
        }
        // check if user exists
        try {
            // if user already exist, return error message
            await getUserByUsername(username);
            return res.status(409).json({ message: "Username taken", success: false });
        } catch (error) {
            if (error instanceof NotFoundError) {
                // user not found, can proceed with registration
            } else {
                throw error; // if unexpected error, throw it again
            }
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
        return res.status(201).json({ message: 'User created', success: true, user: newUser});
    } catch (error) {
        // if unknown error occured, log to console and return internal server error message to client
        console.error('Unexpected error while registering a user:', error);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
});

// route of login of existing user
authRouter.post("/login", async (req, res) => {
try {
    // get username and password from body
    const { username, password } = req.body;
    // if input is invalid, return error message
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required', success: false });
    }
    // try to fetch user from db
    let user;
    try {
        user = await getUserByUsername(username);
    } catch (error) {
        if (error instanceof NotFoundError) {
            // if user is not found, return error message
            return res.status(401).json({ message: 'Invalid username', success: false });
        }
        throw error; // if unexpected error, throw it again
    }
    // check if saved hash password matches, if doesn't then return error
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(401).json({ message: 'Invalid username or password', success: false });
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
    console.log(username, "logged in");
    res.status(200).json({ message: 'Login successful', success: true });
} catch (error) {
    console.error('Unexpected error while login:', error);
    res.status(500).json({ message: 'Internal server error', success: false });
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
        // if not found error, return not found error message
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: 'User not found', success: false });
        }
        // if other error, return it and log to console
        console.log("Error while fetching user profile:", error);
        res.status(500).json({ message: 'Failed to retrieve user profile', success: false });
    }
  });

// export the router
export default authRouter;