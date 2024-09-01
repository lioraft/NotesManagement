import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import 'jest';
// import models
import NoteModel from 'models/NoteModel';
import UserModel from 'models/UserModel';

// create mongo memory server instance
let mongoServer: MongoMemoryServer;

// initialize the server before starting
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// stop the server after finishing
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// clear the database after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    if (collections.hasOwnProperty(key)) {
      await collections[key].deleteMany({});
    }
  }
});
