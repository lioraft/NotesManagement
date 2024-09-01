import { Router } from 'express';
import { subscribeToUser } from '../services/UserService';
import mongoose from 'mongoose';
import { ValidationError, NotFoundError } from '../error';

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
        try {
            const updatedSubscriptions = await subscribeToUser(new mongoose.Types.ObjectId(subscriberUserID), subscriptionUserID);
            // if success, log to console
            console.log("The user:", subscriberUserID, "subscribed to:", subscriptionUserID);
            // return the updated list of subscriptions
            res.status(200).json({ message: 'Subscription successful', success: true, subscriptions: updatedSubscriptions });
        } catch (error) {
            // if error, return correct error message and code
            if (error instanceof ValidationError) {
                return res.status(400).json({ message: error.message, success: false });
            } else if (error instanceof NotFoundError) {
                return res.status(404).json({ message: error.message, success: false });
            }
            throw error; // unexpected error
        }
    } catch (error) {
        console.error('Error subscribing to user:', error);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
});

// export the router
export default subRouter;