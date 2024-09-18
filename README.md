# Notes Management

## Directories
- **src** - contains the source code of the assignment.
- **src/schemas** - mongoose schemas that define the shape of the documents in collections.
- **src/models** - mongoose models that will be used to create instances (documents).
- **src/routes** - definitions of end points for different requests.
- **src/services** - intermediaries between route handlers and the data models.
- **src/tests** - contains tests for the assignment.
- **src/docs** - contains API documentation in yaml, and an html file for api-docs route.

## How to run
1. Clone the repository
   ```bash
   git clone https://github.com/lioraft/NotesManagement.git
2. open terminal and install dependencies
   ```bash
   npm install
3. build and run the project
   ```bash
   npm run build
   npm start
4. Now you can start sending requests with tools like Postman
   ```bash
   http://localhost:3500/<insert end point>
5. To run tests, run the following command
   ```bash
   npm test
6. To see documentation, enter the following end point:
   ``` bash
   http://localhost:3500/api-docs
