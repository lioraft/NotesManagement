# BIGVU_Assignment
Assumptions I made for this assignment:
1. Every user has a unique username, in order to provide correct login and avoid duplicates of users having the same username and password.
2. Profile of a user includes the username, the user's he subscribed to and his notes.
3. Passwords are sensitive and need to be stored in a secure manner, so they are stored after hashing.
4. In notes management, GET /notes returns notes created by either the user itself or the users he subscribed to.
5. Everyone can get notes by GET /notes/:id if they have the ID of the desired note.