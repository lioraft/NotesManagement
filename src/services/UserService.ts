import UserModel from '../models/UserModel';
import mongoose from 'mongoose';
import { ValidationError, NotFoundError, ConflictError } from '../error'

// get user by username
export const getUserByUsername = async (username: string) => {
  // if no username or invalid type, throw error
  if (typeof username !== 'string' || username.trim().length === 0) {
    throw new ValidationError('Invalid username');
  }
  const user = await UserModel.findOne({ username }).exec();
  // check if the user exists
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
};

// get user by id
export const getUserByID = async (userIdString: string) => {
  // if no id, throw error
  if (!userIdString) {
    throw new ValidationError('Invalid UserID');
  }
  // try to convert to moongose object id, if can't - throw validation error
  let userId;
  try {
    userId = new mongoose.Types.ObjectId(userIdString);
  } catch(error) {
    throw new ValidationError('Invalid ObjectId');
  }
  const user = await UserModel.findById(userId).exec();
  // check if the user exists
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
};

// add new user
export const addUser = async (record: { username: string; password: string }) => {
    // validate username and password
    if (typeof record.username !== 'string' || record.username.trim().length === 0) {
      throw new ValidationError('Invalid username');
    }
    if (typeof record.password !== 'string' || record.password.trim().length === 0) {
      throw new ValidationError('Invalid password');
    }
    // check no duplicates
    const existingUser = await UserModel.findOne({ username: record.username }).exec();
    if (existingUser) {
      throw new ConflictError('Username already exists');
    }
    // create a new user
    const newUser = new UserModel(record);
    // save the new user to db
    const savedUser = await newUser.save();
    // return the saved user object
    return savedUser.toObject();
};

// get all subscriptions for a user by user id
export const getSubscriptions = async (userIdString: string) => {
    // if no id, throw error
    if (!userIdString) {
      throw new ValidationError('Invalid ObjectId');
    }
    // try to convert to moongose object id, if can't - throw validation error
    let userId;
    try {
      userId = new mongoose.Types.ObjectId(userIdString);
    } catch(error) {
      throw new ValidationError('Invalid ObjectId');
    }
    // find the user by user id and populate the subscriptions
    const user = await UserModel.findById(userId).populate('subscriptions', 'username');
    // check if the user exists
    if (!user) {
      throw new NotFoundError('User not found');
    }
    // return the list of subscriptions
    return user.subscriptions;
};

// subscribe a user to another user
export const subscribeToUser = async (subscriberUserStr: string, subscriptionUserStr: string) => {
    // if no id, throw error
    if (!subscriberUserStr || !subscriptionUserStr) {
      throw new ValidationError('Invalid ObjectId');
    }
  // try to convert to moongose object id, if can't - throw validation error
  let subscriberUserID, subscriptionUserID;
  try {
    // convert to moongose object id
    subscriberUserID = new mongoose.Types.ObjectId(subscriberUserStr);
    subscriptionUserID = new mongoose.Types.ObjectId(subscriptionUserStr);
  } catch(error) {
    throw new ValidationError('Invalid ObjectId');
  }
  // check ids are different so users won't subscribe to themselves
  if (subscriberUserID.equals(subscriptionUserID)) {
    throw new ValidationError('Users can not subscribe to themselves');
  }
  // find the subscriber user
  const subscriber = await UserModel.findById(subscriberUserID);
  if (!subscriber || !Array.isArray(subscriber.subscriptions)) {
    throw new NotFoundError('Subscriber user not found');
  }

  // find the user to subscribe to
  const subscriptionUser = await UserModel.findById(subscriptionUserID);
  if (!subscriptionUser) {
    throw new NotFoundError('Subscription user not found');
  }

  // check if the subscriber is already subscribed to the user
  if (subscriber.subscriptions.includes(subscriptionUser._id)) {
    throw new ConflictError('Already subscribed to this user');
  }

  // add the subscription user's ID to the subscriber's subscriptions list
  subscriber.subscriptions.push(subscriptionUser._id);
  await UserModel.updateOne({ _id: subscriber._id }, { subscriptions: subscriber.subscriptions });

  return subscriber.subscriptions;
};

export const getUserProfile = async (userIdString: string) => {
  // if no id, throw error
  if (!userIdString) {
    throw new ValidationError('Invalid ObjectId');
  }
  // try to convert to moongose object id, if can't - throw validation error
  let userId;
  try {
    userId = new mongoose.Types.ObjectId(userIdString);
  } catch(error) {
    throw new ValidationError('Invalid ObjectId');
  }
  const user = await UserModel.findById(userId)
    .select('-password')
    .populate('subscriptions', 'username')
    .populate({
      path: 'lastCreatedNote',
      populate: {
        path: 'sentimentAnalysis',
        model: 'SentimentAnalysis'
      }
    })
    .exec();
  // check if the user exists
  if (!user) {
    throw new NotFoundError('User not found');
  }
  // return the populated user profile
  return user;
};
