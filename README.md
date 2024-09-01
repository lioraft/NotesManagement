# BIGVU_Assignment
Assumptions I made for this assignment:
1. Every user has a unique username, in order to provide correct login and avoid duplicates of users having the same username and password.
2. Profile of a user includes the username, the users he subscribed to and the latest sentiment analysis.
3. Passwords are sensitive and need to be stored in a secure manner, so they are stored after hashing.
4. In notes management, GET /notes returns notes created by either the user itself or the users he subscribed to.
5. Everyone can get notes by GET /notes/:id if they have the ID of the desired note.
## Directories
- **src** - contains the source code of the assignment.
- **src/schemas** - mongoose schemas that define the shape of the documents in collections.
- **src/models** - mongoose models that will be used to create instances (documents).
- **src/routes** - definitions of end points for different requests.
- **src/services** - intermediaries between route handlers and the data models.
- **src/tests** - contains tests for the assignment.

## How to run
1. Clone the repository
   ```bash
   git clone https://github.com/lioraft/BIGVU_Assignment.git
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
   