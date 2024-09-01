import mongoose from 'mongoose';
import NoteModel from '../models/NoteModel';
import UserModel from '../models/UserModel';
import * as noteService from '../services/NoteService';
import { ValidationError, NotFoundError } from '../error';

describe('Note Service', () => {

  describe('addNote', () => {
    // valid test case: adding a note
    it('should add a new note', async () => {
      const user = new UserModel({ username: 'testuser', password: 'password123' });
      await user.save();
      // create note and save it
      const note = { userId: user._id as mongoose.Types.ObjectId, title: 'Test Note', body: 'This is a test note' };
      // mock the analyzeSentiment function to return a valid sentiment analysis ID
      const mockSentimentAnalysisId = new mongoose.Types.ObjectId();
      jest.spyOn(noteService, 'analyzeSentiment').mockResolvedValue(mockSentimentAnalysisId);
      const savedNote = await noteService.addNote(note);
      // check note is valid
      expect(savedNote.title).toBe(note.title);
      expect(savedNote.body).toBe(note.body);
      expect(savedNote.userId).toBe(user._id);
    });

    // invalid test case: missing required fields
    it('should throw validation error for missing title', async () => {
    // no user id
      const user = new UserModel({ username: 'testuser', password: 'password123' });
      await user.save();

      const note = { userId: user._id as mongoose.Types.ObjectId, body: 'This is a test note', title:'' }; // missing title
      await expect(noteService.addNote(note)).rejects.toThrowError(ValidationError);
    });

    // invalid case: trying to add a note for a user that doesn't exist
    it('should delete the note if user is not found after creation', async () => {
        const mockUserId = new mongoose.Types.ObjectId();
        const mockSentimentAnalysisId = new mongoose.Types.ObjectId();
        // mock the analyzeSentiment function to return a valid sentiment analysis ID
        jest.spyOn(noteService, 'analyzeSentiment').mockResolvedValue(mockSentimentAnalysisId);
         // spy on the delete method of the NoteModel and mock its return value
         const findByIdAndUpdateSpy = jest.spyOn(UserModel, 'findByIdAndUpdate').mockResolvedValue(null);
        // mock UserModel.findByIdAndUpdate to return null (indicating user not found)
        jest.spyOn(UserModel, 'findByIdAndUpdate').mockResolvedValue(null);
        // try to add the note and verify not found error was thrown
        await expect(noteService.addNote({
          userId: mockUserId,
          title: 'Test Title',
          body: 'Test Body',
        })).rejects.toThrowError(NotFoundError);
        // verify that the note was deleted by checking the deletion call
        expect(findByIdAndUpdateSpy).toHaveBeenCalled();
      });
  });

  describe('getNoteById', () => {
    // Valid case: fetch a note by valid ID
    it('should get a note by valid ID', async () => {
    // create and save fake user
      const user = new UserModel({ username: 'testuser', password: 'password123' });
      await user.save();
    // create a note for the user
      const note = new NoteModel({ userId: user._id, title: 'Test Note', body: 'This is a test note' });
      const savedNote = await note.save();
    // get not and make sure the data is correct
      const foundNote = await noteService.getNoteById(savedNote._id as mongoose.Types.ObjectId);
      expect(foundNote).not.toBeNull();
      expect(foundNote.title).toBe(note.title);
      expect(foundNote.body).toBe(note.body);
    });

    // invalid case: note does not exist
    it('should throw not found error for non-existent note', async () => {
      const validId = new mongoose.Types.ObjectId();
      await expect(noteService.getNoteById(validId)).rejects.toThrowError(NotFoundError);
    });

    // invalid case: malformed ID
    it('should throw validation error for malformed ID', async () => {
      const malformedId = '123'; // not a valid ObjectId
      await expect(noteService.getNoteById(malformedId as unknown as mongoose.Types.ObjectId)).rejects.toThrowError(ValidationError);
    });
  });

  describe('getNotes', () => {
    // valid case: fetch notes for a user
    it('should get all notes for a user', async () => {
    // create user and save him
      const user = new UserModel({ username: 'testuser', password: 'password123' });
      await user.save();
    // create notes for user and save them
      const note1 = new NoteModel({ userId: user._id, title: 'Note 1', body: 'Body 1' });
      const note2 = new NoteModel({ userId: user._id, title: 'Note 2', body: 'Body 2' });
      const savedNote1 = await note1.save();
      const savedNote2 =await note2.save();
    // check notes were saved
      const notes = await noteService.getNotes(user._id as mongoose.Types.ObjectId);
      expect(notes).toHaveLength(2);
      // check ids match
      expect(notes[0]._id.toString()).toBe(savedNote1._id.toString());
      expect(notes[1]._id.toString()).toBe(savedNote2._id.toString());
      // check titles match
      expect(notes[0].title).toBe('Note 1');
      expect(notes[1].title).toBe('Note 2');
      // check bodies match
      expect(notes[0].body).toBe('Body 1');
      expect(notes[1].body).toBe('Body 2');
    });
  });
});
