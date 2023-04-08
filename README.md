https://console.firebase.google.com/u/1/project/track-questions/database/track-questions-default-rtdb/data/~2F


To build an app that can manage a large database of questions, limit their usage, and track their usage for a test, you will need to use some kind of backend service to store the questions and their associated data. For this, you could use a backend service such as Firebase or MongoDB.

Here's a general idea of how you could implement this:

Create a form component where users can upload a file with the questions or select a database from which to import questions. You will need to write code to parse the file or database and store the questions in the backend service.

In the backend, create a data model for the questions that includes fields for the question text, the remaining usage limit, and a timestamp representing when the question was last used.

Use a backend service like Firebase or MongoDB to store the questions in the database.

When the app needs to pick questions for a test, retrieve a random sample of questions from the database and update their usage limit and timestamp in the database.

Display the questions to the user and track their usage limit and timestamp.

You will need to customize it to fit your specific requirements. You will also need to implement the backend service and data model, which will depend on the service you choose to use.

To access questions from an external source or file, you could implement a parser that reads the file format and extracts the questions, or you could use an API to retrieve questions from an external database. Some possible ways to access questions from external sources are:

CSV or Excel files: You could use a library like PapaParse or SheetJS to parse the file and extract the questions.
SQL databases: You could use a library like Sequelize or Knex.js to connect to the database and retrieve the questions.

REST APIs: You could use libraries like Axios or Fetch to make requests to a REST API that returns questions in a JSON format.
GraphQL APIs: You could use libraries like Apollo Client or Relay to query a GraphQL API that returns questions in a structured format.
Once you have extracted the questions from an external source, you can store them in the backend service as described above.