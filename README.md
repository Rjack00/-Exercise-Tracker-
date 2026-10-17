# Exercise Tracker

A full-stack exercise tracking application built with Node.js, Express, MongoDB, and vanilla JavaScript. Users can create profiles, record exercises, and view, filter, edit, and delete exercise logs through a responsive web interface.

**[Live Demo](https://exercise-tracker-8ly3.onrender.com)** · **[GitHub Repository](https://github.com/Rjack00/-exercise-tracker-)**

## Features

- Create user profiles with unique usernames.
- Add exercises with descriptions, durations, and dates.
- View exercise logs with date-range and result-limit filters.
- Edit existing exercises and delete exercises from a user's log.
- Validate user input and return appropriate HTTP status codes for invalid requests and missing resources.
- Persist user profiles and exercise data in MongoDB.
- Use a responsive interface with reusable modal dialogs for feedback and confirmations.

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas, Mongoose
- **Frontend:** HTML, CSS, vanilla JavaScript
- **Development:** npm, Nodemon, Postman
- **Deployment:** Render

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/users` | Create a user |
| `GET` | `/api/users` | Retrieve all users |
| `POST` | `/api/users/:_id/exercises` | Add an exercise to a user |
| `GET` | `/api/users/:_id/logs` | Retrieve a user's exercise log |
| `PUT` | `/api/exercises/:exerciseId` | Update an exercise |
| `DELETE` | `/api/exercises/:exerciseId` | Delete an exercise |

### Exercise Log Filters

The `GET /api/users/:_id/logs` endpoint supports these optional query parameters:

| Parameter | Description |
|---|---|
| `from` | Filter exercises starting from this date |
| `to` | Filter exercises through this date, inclusive |
| `limit` | Limit the number of returned exercises |

Dates should use the `YYYY-MM-DD` format.

Example:

```text
/api/users/USER_ID/logs?from=2026-01-01&to=2026-01-31&limit=10
```

A successful log request returns the user's ID, username, result count, and an array of exercises.

```json
{
  "_id": "USER_ID",
  "username": "sampleuser",
  "count": 1,
  "log": [
    {
      "_id": "EXERCISE_ID",
      "description": "Running",
      "duration": 30,
      "date": "Mon Jan 05 2026"
    }
  ]
}
```

## Validation and Error Handling

The API validates incoming data before saving changes.

- Usernames are required, trimmed, limited to 30 characters, and must be unique.
- Exercise descriptions are required, trimmed, and limited to 100 characters.
- Exercise durations must be positive whole numbers.
- Invalid user IDs, exercise IDs, and dates are rejected.
- Missing users, exercises, and routes return appropriate not-found responses.
- Database validation errors and duplicate usernames are handled without returning an unhandled server error.

## Run Locally

### Prerequisites

- [Node.js](https://nodejs.org/)
- npm
- A MongoDB database, such as MongoDB Atlas

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Rjack00/-exercise-tracker-.git
   ```

2. Navigate into the project directory:

   ```bash
   cd exercise-tracker
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the project root:

   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=3000
   ```

   Replace the placeholder with your MongoDB connection string. Do not commit your `.env` file or expose database credentials.

5. Start the development server:

   ```bash
   npm run dev
   ```

   Alternatively, start the application with:

   ```bash
   npm start
   ```

6. Open `http://localhost:3000` in your browser.

## Testing

The application was tested through the browser interface and Postman, including:

- Creating users and adding exercises.
- Retrieving and filtering exercise logs.
- Updating and deleting exercises.
- Checking invalid input, dates, and IDs.
- Verifying error responses for missing resources and duplicate usernames.
- Confirming database changes persist after refreshing the application.

## Project Background

This project began as a [freeCodeCamp Back End Development and APIs](https://www.freecodecamp.org/learn/back-end-development-and-apis/) exercise tracker project. It was expanded with additional API functionality, input validation, error handling, and a frontend interface to create a more complete and functional application.