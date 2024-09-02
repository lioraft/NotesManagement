import { Router } from 'express';
import { getNoteById, getNotes, addNote } from '../services/NoteService';

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
        // check if userId is not null
        if (userIdString) {
            // create a new note with the converted ObjectId
            const createdNote = await addNote(userIdString, title, body);
            // if success log to console and send
            console.log("A new note: ", createdNote._id," was created by:", userIdString)
            res.status(201).json({success: true, createdNote});
        } else {
            res.status(400).json({ error: 'User ID not found in request' });
        }
    } catch (error) {
        // log error to console
        console.error('Error while adding a new note:', error);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        res.status(statusCode).json({message, success: false});
    }
});

// Router to get notes of user that were created by him or the users he subscribed to
noteRouter.get('/', async (req, res) => {
    try {
      // get userid
      const userIdString = req.userId;
      if (userIdString) {
        // retrieve the notes for the authenticated user
        const notes = await getNotes(userIdString);
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
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        res.status(statusCode).json({message, success: false});
    }
  });

// Router to get notes by ID
noteRouter.get('/:id', async (req, res) => {
    try {
        // get id of note
        const { id } = req.params;
        // retrieve the note and sentiment analysis using the ID
        const { note, sentimentAnalysis } = await getNoteById(id);
        // log to console
        console.log("fetched note:", id)
        // return the found note
        res.status(200).send({ note, sentimentAnalysis, success: true });
    } catch (error) {
        // log error to console
        console.error('Error while retrieving a note:', error);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        res.status(statusCode).json({message, success: false});
    }
});

// export the router
export default noteRouter;
