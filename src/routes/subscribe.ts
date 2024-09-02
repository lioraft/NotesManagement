import { Router } from 'express';
import { subscribeToUser } from '../services/UserService';

const subRouter = Router();

// subscribe the authenticated user to another user
subRouter.post('/:userId', async (req, res) => {
    try {
        // extract the user ID of the user to subscribe to from the route parameters
        const subscriptionUserID = req.params.userId;
        // extract the authenticated user's ID from the request
        const subscriberUserID = req.userId; 
        // if no user is found, return error message
        if (!subscriberUserID) {
            return res.status(401).send({ message: 'User not authenticated', success: false });
        }
        // subscribe the authenticated user to the target user
        const updatedSubscriptions = await subscribeToUser(subscriberUserID, subscriptionUserID);
        // if success, log to console
        console.log("The user:", subscriberUserID, "subscribed to:", subscriptionUserID);
        // return the updated list of subscriptions
        res.status(200).json({ message: 'Subscription successful', success: true, subscriptions: updatedSubscriptions });
    } catch (error) {
        // if error, return correct error message and code
        console.error('Error subscribing to user:', error);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        res.status(statusCode).json({message, success: false});
    }
});

// export the router
export default subRouter;