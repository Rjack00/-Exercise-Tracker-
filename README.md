# Exercise Tracker

A REST API that lets users create profiles and log workout exercises. Built as part of [freeCodeCamp's Back End Development certification](https://www.freecodecamp.org/learn/back-end-development-and-apis/).

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat&logoColor=white)

## Features

- Create users and retrieve a full user list
- Log exercises with description, duration, and optional date
- Retrieve a user's full exercise log with optional `from`, `to`, and `limit` filters

## API Endpoints

<table>
  <tr>
    <th width="120">Method</th>
    <th width="300">Endpoint</th>
    <th width="400">Description</th>
  </tr>
  <tr>
    <td><code>POST</code></td>
    <td><code>/api/users</code></td>
    <td>Create a new user</td>
  </tr>
  <tr>
    <td><code>GET</code></td>
    <td><code>/api/users</code></td>
    <td>Get all users</td>
  </tr>
  <tr>
    <td><code>POST</code></td>
    <td><code>/api/users/:_id/exercises</code></td>
    <td>Add an exercise to a user</td>
  </tr>
  <tr>
    <td><code>GET</code></td>
    <td><code>/api/users/:_id/logs</code></td>
    <td>Get a user's exercise log</td>
  </tr>
</table>

**Log query params (all optional and can be used individually):**
`from` (yyyy-mm-dd) · `to` (yyyy-mm-dd) · `limit` (number)

**Example GET Call with query params:** 
GET /api/users/:_id/logs?from=2024-01-01&to=2024-12-31&limit=5

## Run Locally

1. Clone the repo and install dependencies:
```bash
   git clone https://github.com/YOUR_USERNAME/exercise-tracker.git
   cd exercise-tracker
   npm install
```

2. Create a `.env` file in the root:
```
   MONGO_URI=your_mongodb_connection_string
   PORT=3000
```

3. Start the dev server:
```bash
   npm run dev
```

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MongoDB Atlas
- **ODM:** Mongoose