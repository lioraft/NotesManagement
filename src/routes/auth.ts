import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getUserByUsername, addUser } from '../services/UserService';
import { generateToken } from '../services/jwtUtils'

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
        // success message
        return res.status(201).send({ message: 'User created', success: true, user: newUser});
    } catch (error) {
        console.error('Unexpected error:', error);
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
        res.status(200).send({ message: 'Login successful', success: true });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).send({ message: 'Internal server error', success: false });
    }
});


// export the router
export default authRouter;