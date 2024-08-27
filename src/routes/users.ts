import { Router } from 'express';
import { getSubscriptions } from '../services/UserService';
import mongoose from 'mongoose';


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
        const subscriptions = await getSubscriptions(new mongoose.Types.ObjectId(userId));
        // return subscriptions
        res.status(200).json({ success: true, subscriptions });
    } catch (error) {
        res.status(500).send({ message: error.message, success: false });
    }
});

// export the router
export default userRouter;