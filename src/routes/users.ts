import { Router } from 'express';
import { getSubscriptions } from '../services/UserService';
import mongoose from 'mongoose';
import { ValidationError, NotFoundError } from '../error';


const userRouter = Router();

// route to list all users
userRouter.get('/', async (req, res) => {
    try {
        // extract the authenticated user's ID from the request
        const userId = req.userId; 
        // if no user is found, return error message
        if (!userId) {
            return res.status(401).send({ message: 'User not authenticated', success: false });
        }
        // get subscriptions
        try {
            const subscriptions = await getSubscriptions(new mongoose.Types.ObjectId(userId));
            // log the fetched subscriptions
            console.log("Fetched subscriptions for user:", userId);
            // return the subscriptions list
            res.status(200).json({ success: true, subscriptions });
        } catch (error) {
            // if error during fetching subscriptions, send correct error message to client
            if (error instanceof ValidationError) {
                return res.status(400).json({ message: error.message, success: false });
            } else if (error instanceof NotFoundError) {
                return res.status(404).json({ message: error.message, success: false });
            }
            throw error; // if other unexpected error, rethrow
        }
    } catch (error) {
        console.log("failed fetching users");
        res.status(500).send({ message: error.message, success: false });
    }
});

// export the router
export default userRouter;