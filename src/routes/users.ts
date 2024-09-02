import { Router } from 'express';
import { getSubscriptions } from '../services/UserService';


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
        const subscriptions = await getSubscriptions(userId);
        // log the fetched subscriptions
        console.log("Fetched subscriptions for user:", userId);
        // return the subscriptions list
        res.status(200).json({ success: true, subscriptions });
    } catch (error) {
        console.log("failed fetching users");
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        res.status(statusCode).json({message, success: false});
    }
});

// export the router
export default userRouter;