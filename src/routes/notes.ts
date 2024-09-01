import { Router } from 'express';
import mongoose from 'mongoose';
import { getNoteById, getNotes, addNote } from '../services/NoteService';
import { NotFoundError, ValidationError } from '../error';

// create a router
const noteRouter = Router();

// Route to create a new note
noteRouter.post('/', async (req, res) => {
    try {
        // get title and body of the new note
        const { title, body } = req.body;
        // if no title or no body, return error
        if (!title || !body) {
            return res.status(400).json({ error: 'Title and body are required' });
        }
        // get userid 
        const userIdString = req.userId;
        // check if userIdString is not null
        if (userIdString) {
            // convert userIdString to ObjectId
            const userId = new mongoose.Types.ObjectId(userIdString);
            // create a new note with the converted ObjectId
            const newNote = { userId, title, body };
            const createdNote = await addNote(newNote);
            // if success log to console and send
            console.log("A new note: ", createdNote._id," was created by:", userIdString)
            res.status(201).json({success: true, createdNote});
        } else {
            res.status(400).json({ error: 'User ID not found in request' });
        }
    } catch (error) {
        // log error to console
        console.error('Error while adding a new note:', error);
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
        } else if (error instanceof NotFoundError) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal error during note creation' });
        }
    }
});

// Router to get notes of user that were created by him or the users he subscribed to
noteRouter.get('/', async (req, res) => {
    try {
      // get userid
      const userIdString = req.userId;
      if (userIdString) {
        // convert userIdString to objectId
        const userId = new mongoose.Types.ObjectId(userIdString);
        // retrieve the notes for the authenticated user
        const notes = await getNotes(userId);
        // log to console
        console.log("fetched notes for user:", userIdString);
        // return notes
        res.status(200).json({ success: true, notes });
      }
      else{
        res.status(400).json({ error: 'User ID not found in request' });
      }
    } catch (error) {
        // log error to console
        console.error('Error while fetching notes:', error);
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
        } else if (error instanceof NotFoundError) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal error while fetching notes' });
        }
    }
  });

// Router to get notes by ID
noteRouter.get('/:id', async (req, res) => {
    try {
        // get id of note
        const { id } = req.params;
        // validate the note ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ message: 'Invalid note ID', success: false });
        }
        // retrieve the note using the ID
        const note = await getNoteById(new mongoose.Types.ObjectId(id));
        // log to console
        console.log("fetched note:", id)
        // return the found note
        res.status(200).send({ note, success: true });
    } catch (error) {
        // log error to console
        console.error('Internal server error while retrieving note:', error);
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
        } else if (error instanceof NotFoundError) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal error while retrieving note' });
        }
    }
});

// export the router
export default noteRouter;
