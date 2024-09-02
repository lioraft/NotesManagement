// errors file
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
  