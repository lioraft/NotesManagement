import { Router } from 'express';
import { subscribeToUser } from '../services/UserService';
import mongoose from 'mongoose';

const subRouter = Router();

// subscribe the authenticated user to another user
subRouter.post('/:userId', async (req, res) => {
    try {
        // extract the user ID of the user to subscribe to from the route parameters
        const subscriptionUserID = new mongoose.Types.ObjectId(req.params.userId);
        // extract the authenticated user's ID from the request
        const subscriberUserID = req.userId; 
        // if no user is found, return error message
        if (!subscriberUserID) {
            return res.status(401).send({ message: 'User not authenticated', success: false });
        }
        // subscribe the authenticated user to the target user
        const updatedSubscriptions = await subscribeToUser(new mongoose.Types.ObjectId(subscriberUserID), subscriptionUserID);
        // log to console
        console.log("the user:", subscriberUserID, "subscribed to:", subscriptionUserID);
        // return the updated list of subscriptions
        res.status(200).send({ message: 'Subscription successful', success: true, subscriptions: updatedSubscriptions });
    } catch (error) {
        console.error('Error subscribing to user:', error);
        res.status(500).send({ message: error.message, success: false });
    }
});

// export the router
export default subRouter;