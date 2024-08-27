import UserModel from '../models/UserModel';
import mongoose from 'mongoose';

// get user by username
export const getUserByUsername = async (username: string) => {
  return await UserModel.findOne({ username }).exec();
};

// get user by id
export const getUserByID = async (userId: mongoose.Types.ObjectId) => {
  return await UserModel.findById(userId).exec();
};

// add new user
export const addUser = async (record: { username: string; password: string }) => {
    // create a new user
    const newUser = new UserModel(record);
    // save the new user to db
    const savedUser = await newUser.save();
    // return the saved user object
    return savedUser.toObject();
};

// get all subscriptions for a user by user id
export const getSubscriptions = async (userId: mongoose.Types.ObjectId) => {
    // find the user by username and populate the subscriptions
    const user = await UserModel.findById(userId).populate('subscriptions', 'username');
    // return the list of subscriptions
    return user.subscriptions;
};

// subscribe a user to another user
export const subscribeToUser = async (subscriberUserID: mongoose.Types.ObjectId, subscriptionUserID: mongoose.Types.ObjectId) => {
    // find the subscriber user
    const subscriber = await UserModel.findById(subscriberUserID);
    if (!subscriber || !Array.isArray(subscriber.subscriptions)) {
      throw new Error('Subscriber user not found or invalid');
    }

    // find the user to subscribe to
    const subscriptionUser = await UserModel.findById(subscriptionUserID);
    if (!subscriptionUser) {
      throw new Error('Subscription user not found or invalid');
    }

    // check if the subscriber is already subscribed to the user
    if (subscriber.subscriptions.includes(subscriptionUser._id)) {
      throw new Error('Already subscribed to this user');
    }

    // add the subscription user's ID to the subscriber's subscriptions list
    subscriber.subscriptions.push(subscriptionUser._id);
    await UserModel.updateOne({ _id: subscriber._id }, { subscriptions: subscriber.subscriptions });

    return subscriber.subscriptions;
};
