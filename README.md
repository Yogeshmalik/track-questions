To build an app that can manage a large database of questions, limit their usage, and track their usage for a test, you will need to use some kind of backend service to store the questions and their associated data. For this, you could use a backend service such as Firebase or MongoDB.

Here's a general idea of how you could implement this:

Create a form component where users can upload a file with the questions or select a database from which to import questions. You will need to write code to parse the file or database and store the questions in the backend service.

In the backend, create a data model for the questions that includes fields for the question text, the remaining usage limit, and a timestamp representing when the question was last used.

Use a backend service like Firebase or MongoDB to store the questions in the database.

When the app needs to pick questions for a test, retrieve a random sample of questions from the database and update their usage limit and timestamp in the database.

Display the questions to the user and track their usage limit and timestamp.