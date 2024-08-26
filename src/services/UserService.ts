import UserModel from '../models/UserModel';

// get all users
export const getUsers = async () => UserModel.find();

// get user by username
export const getUserByUsername = async (username: string) => UserModel.findOne({ username });

// add new user
export const addUser = async (record: Record<string, any>) => new UserModel(record).save().then((user) => user.toObject());

// get all subscriptions for a user by username
export const getSubscriptions = async (username: string) => {
    // find the user by username and populate the subscriptions
    const user = await UserModel.findOne({ username }).populate('subscriptions', 'username');
    // return the list of subscriptions
    return user.subscriptions;
};

// subscribe a user to another user
export const subscribeToUser = async (subscriberUsername: string, subscriptionUsername: string) => {
    // find the subscriber user
    const subscriber = await UserModel.findOne({ username: subscriberUsername });
    if (!subscriber || !Array.isArray(subscriber.subscriptions)) {
      throw new Error('Subscriber user not found or invalid');
    }

    // find the user to subscribe to
    const subscriptionUser = await UserModel.findOne({ username: subscriptionUsername });
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
