// errors file
import { Response } from 'express';
export class AppError extends Error {
    public readonly statusCode: number;
  
    constructor(message: string, statusCode: number = 500) {
      super(message);
      this.statusCode = statusCode;
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  // error of invalid object ids or usernames
  export class ValidationError extends AppError {
    constructor(message: string) {
      super(message, 400); // HTTP status code for Bad Request
    }
  }
  
  // error for non existent objects
  export class NotFoundError extends AppError {
    constructor(message: string) {
      super(message, 404); // HTTP status code for Not Found
    }
  }
  
  // error for duplicates and conflicts
  export class ConflictError extends AppError {
    constructor(message: string) {
      super(message, 409); // HTTP status code for Conflict
    }
  }

  // function that sets the right message in error based on the error type
  export function returnError(error: Error, res: Response) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message, success: false });
    } else if (error instanceof NotFoundError) {
        return res.status(404).json({ message: error.message, success: false });
    } else if (error instanceof ConflictError) {
      return res.status(409).json({ message: error.message, success: false });
    } else {
        res.status(500).json({ message: 'Internal server error', success: false });
    }
  }
  