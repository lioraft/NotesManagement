import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// create Mongo Memory Server instance
let mongoServer: MongoMemoryServer;

// Initialize the server before starting tests. connection as a singleton
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  }
});

// stop the server after finishing all tests
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  }
});

beforeEach(async() => {
  // reset mocks before each test
  jest.clearAllMocks();
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
