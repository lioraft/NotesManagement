import mongoose from 'mongoose';
import UserModel from '../models/UserModel';
import NoteModel from '../models/NoteModel';
import * as userService from '../services/UserService';
import { ValidationError, NotFoundError, ConflictError } from '../error';

describe('User Service', () => {

  describe('getUserByUsername', () => {
    // valid case test: fetching a valid user
    it('should get a user by username', async () => {
      const user = new UserModel({ username: 'testuser', password: 'password123' });
      await user.save();
      const foundUser = await userService.getUserByUsername('testuser');
      expect(foundUser).not.toBeNull();
      expect(foundUser.username).toBe(user.username);
    });

    // invalid case test: fetching non existent user
    it('should throw not found error if user does not exist', async () => {
      await expect(userService.getUserByUsername('nonexistentuser')).rejects.toThrowError(NotFoundError);
    });

    // invalid case test: fetching invalid username
    it('should throw validation error for invalid username', async () => {
      await expect(userService.getUserByUsername('')).rejects.toThrowError(ValidationError);
    });
  });

  describe('getUserByID', () => {
    // valid case: fetch valid user
    it('should get user by valid ID', async () => {
      // create and save a new user
      const user = new UserModel({ username: 'testuser', password: 'password123' });
      const savedUser = await user.save();
      
      // retrieve the user by ID
      const foundUser = await userService.getUserByID(savedUser._id as mongoose.Types.ObjectId);
      
      // verify the retrieved user
      expect(foundUser).not.toBeNull();
      expect(foundUser.username).toBe(user.username);
      expect(foundUser.password).toBe(user.password);
    });

    // invalid case test: fetching non existent user
    it('should throw not found error if user ID is not found', async () => {
      const validId = new mongoose.Types.ObjectId();
      await expect(userService.getUserByID(validId)).rejects.toThrowError(NotFoundError);
    });

    // invalid case test: fetching invalid user id
    it('should throw validation error for malformed IDs', async () => {
      const malformedId = '123'; // not a valid ObjectId
      await expect(userService.getUserByID(malformedId as unknown as mongoose.Types.ObjectId)).rejects.toThrowError(ValidationError);
    });
  });

  describe('addUser', () => {
    // valid test case: adding valid user
    it('should add a new user', async () => {
      const user = { username: 'testuser', password: 'password123' };
      const savedUser = await userService.addUser(user);
      expect(savedUser.username).toBe(user.username);
      expect(savedUser.password).toBe(user.password);
    });

    // invalid test case: trying to add a user that already exists
    it('should not allow duplicate usernames', async () => {
      const user1 = { username: 'duplicateUser', password: 'password123' };
      const user2 = { username: 'duplicateUser', password: 'password456' };
      await userService.addUser(user1);
      await expect(userService.addUser(user2)).rejects.toThrowError(ConflictError);
    });

    // invalid test cases: no username or password
    it('should throw validation error for invalid username', async () => {
      const user = { username: '', password: 'password123' };
      await expect(userService.addUser(user)).rejects.toThrowError(ValidationError);
    });

    it('should throw validation error for invalid password', async () => {
      const user = { username: 'validuser', password: '' };
      await expect(userService.addUser(user)).rejects.toThrowError(ValidationError);
    });
  });

  describe('getUserProfile', () => {
    // valid test case: get a valid user's profile
    it('should get user profile', async () => {
      // create users for subscription
      const subscriptionUser1 = new UserModel({ username: 'subuser1', password: 'password123' });
      const subscriptionUser2 = new UserModel({ username: 'subuser2', password: 'password123' });
      await subscriptionUser1.save();
      await subscriptionUser2.save();

      // create user to get profile of, and save it
      const user = new UserModel({
        username: 'testuser',
        password: 'password123',
        subscriptions: [subscriptionUser1._id, subscriptionUser2._id]
      });
      const savedUser = await user.save();

      // create a last created note for user and save it
      const note = new NoteModel({ userId: savedUser._id, title: 'This is a test note' , body: 'This is the content' });
      const savedNote = await note.save();
      user.lastCreatedNote = note._id;
      await user.save();

      // fetch user profile and check it's validity
      const userProfile = await userService.getUserProfile(user._id as mongoose.Types.ObjectId);
      expect(userProfile).not.toBeNull(); // check its not null
      expect(userProfile.username).toBe(user.username); // check correct username
      expect(userProfile.password).toBeUndefined(); // check password was not fetched
      if (userProfile.lastCreatedNote) { // check last note it populated and returned correctly
        expect(userProfile.lastCreatedNote).toBeInstanceOf(NoteModel);
        expect(((userProfile.lastCreatedNote as any)._id as mongoose.Types.ObjectId).toString()).toEqual(savedNote._id.toString());
      } else {
        throw new Error("lastCreatedNote is not populated");
      }
      // check subscription list returned and populated correctly
      if (userProfile.subscriptions && (userProfile.subscriptions as Array<mongoose.Types.ObjectId>).length > 0) {
        expect(userProfile.subscriptions).toBeInstanceOf(Array);
        expect(userProfile.subscriptions).toHaveLength(2);
        const subscriptionIds = (userProfile.subscriptions as Array<mongoose.Types.ObjectId>).map((sub: any) => sub._id.toString());
        expect(subscriptionIds).toContain(subscriptionUser1._id.toString());
        expect(subscriptionIds).toContain(subscriptionUser2._id.toString());
      } else {
        throw new Error("Subscriptions are not populated");
      }
    });
    
    // invalid test case: user doesn't exist
      it('should throw not found error for non existent user', async () => {
        const validId = new mongoose.Types.ObjectId();
        await expect(userService.getUserProfile(validId)).rejects.toThrowError(NotFoundError);
      });

    // invalid test case: invalid userid
    it('should throw validation error for invalid user ID', async () => {
      const invalidId = '123'; // not a valid ObjectId
      await expect(userService.getUserProfile(invalidId as unknown as mongoose.Types.ObjectId)).rejects.toThrowError(ValidationError);
    });
  });

  describe('getSubscriptions', () => {
    // valid test case: fetch subscriptions of valid user
    it('should get user subscriptions', async () => {
      const user = new UserModel({ username: 'testuser', password: 'password123', subscriptions: [] });
      const subscriptionUser = new UserModel({ username: 'subscriptionUser', password: 'password123' });
      await subscriptionUser.save();
      (user.subscriptions as mongoose.Types.ObjectId[]).push(subscriptionUser._id as mongoose.Types.ObjectId);
      await user.save();

      const subscriptions = await userService.getSubscriptions(user._id as mongoose.Types.ObjectId);
      expect(subscriptions).toHaveLength(1);
      expect(subscriptions[0].username).toBe(subscriptionUser.username);
    });
    
    // invalid test case: user id is invalid
    it('should throw validation error for invalid user ID', async () => {
      const invalidId = '123'; // not a valid ObjectId
      await expect(userService.getSubscriptions(invalidId as unknown as mongoose.Types.ObjectId)).rejects.toThrowError(ValidationError);
    });

    // invalid test case: user doesn't exist
    it('should throw not found error for non existent user', async () => {
      const validId = new mongoose.Types.ObjectId();
      await expect(userService.getSubscriptions(validId)).rejects.toThrowError(NotFoundError);
    });

    // valid test case: user has no subscriptions
    it('should return empty array if no subscriptions', async () => {
      const user = new UserModel({ username: 'testuser', password: 'password123', subscriptions: [] });
      await user.save();

      const subscriptions = await userService.getSubscriptions(user._id as mongoose.Types.ObjectId);
      expect(subscriptions).toEqual([]);
    });
  });

  describe('subscribeToUser', () => {
    // valid test case: user subscribe to another user
    it('should subscribe a user to another user', async () => {
      const subscriber = new UserModel({ username: 'subscriber', password: 'password123', subscriptions: [] });
      const subscriptionUser = new UserModel({ username: 'subscriptionUser', password: 'password123' });
      await subscriber.save();
      await subscriptionUser.save();

      const subscriptions = await userService.subscribeToUser(subscriber._id as mongoose.Types.ObjectId, subscriptionUser._id as mongoose.Types.ObjectId);
      expect(subscriptions).toHaveLength(1);
      expect(subscriptions[0].toString()).toBe(subscriptionUser._id.toString());
    });

    // invalid test case: one of ids is invalid
    it('should throw validation error for invalid user IDs', async () => {
      const invalidId = '123'; // not a valid ObjectId
      await expect(userService.subscribeToUser(invalidId as unknown as mongoose.Types.ObjectId, invalidId as unknown as mongoose.Types.ObjectId)).rejects.toThrowError(ValidationError);
    });

    // invalid test case: user tries to subscribe to themselves
    it('should throw validation error if user subscribes to themselves', async () => {
      const user = new UserModel({ username: 'testuser', password: 'password123' });
      await user.save();
      await expect(userService.subscribeToUser(user._id as mongoose.Types.ObjectId, user._id as mongoose.Types.ObjectId)).rejects.toThrowError(ValidationError);
    });

    // invalid test case: user doesn't exist
    it('should throw not found error if user to subscribe does not exist', async () => {
      const subscriber = new UserModel({ username: 'subscriber', password: 'password123', subscriptions: [] });
      await subscriber.save();
      const nonExistUser = new mongoose.Types.ObjectId(); // non existent user id
      await expect(userService.subscribeToUser(subscriber._id as mongoose.Types.ObjectId, nonExistUser)).rejects.toThrowError(NotFoundError);
    });
  });
});
