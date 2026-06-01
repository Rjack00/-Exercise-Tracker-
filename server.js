// ──────────────────────────────────────────────────────────────
// 1. CORE IMPORTS — Always present in every Express + Mongoose app
// ──────────────────────────────────────────────────────────────
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/user')

// ──────────────────────────────────────────────────────────────
// 2. GLOBAL MIDDLEWARE — Almost always present
// ──────────────────────────────────────────────────────────────
app.use(cors())  // Enable CORS for all routes (required for browser-based tests)

// ────────────────────────────────────────────
// Parse URL-encoded bodies (for form data)
// This is essential for POST requests with form data
// changes urlencoded data (username=john&description=running&duration=30) to js object
app.use(express.urlencoded({ extended: true}))
// ────────────────────────────────────────────

app.use(express.json())  // Parse JSON bodies → req.body

app.use(express.static('public'))  // Serve static files (index.html, CSS, JS)

// ──────────────────────────────────────────────────────────────
// 3. DATABASE CONNECTION — Standard in every Mongoose app
// ──────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)  // Connect using URI from .env
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// ──────────────────────────────────────────────────────────────
// 4. ROUTES
// ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')  // Send the HTML form page
});


// ──────────────────── Create & Post users ────────────────────

app.post('/api/users', async (req, res) => {
  const { username } = req.body;  // Form sends "username"

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const user = new User({ username });

  try {
    const savedUser = await user.save();  // MongoDB generates _id automatically
    res.json({ username: savedUser.username, _id: savedUser._id });
  } catch (error) {
    console.error('Save failed: ', error);
    
    if (error.code === 11000) {   // Duplicate key/value (username)
      return res.status(400).json({ error: 'Username already taken' });  
    }

    return res.status(500).json({ error: 'Server error' });
  }
});

// ────────────────────── Get All users ──────────────────────

app.get('/api/users', async (req, res) => {  

  try {
    const users = await User.find({})   // Find all users
                            .select('username _id');  // Only return these fields
    res.json(users);     // Returns array of { username, _id }

  } catch (error) { 
    console.error('Error: ', error);
    return res.status(500).json({ error: 'Server error'});
  }
  
  
});

// ────────────────────── Add Exercise ──────────────────────

app.post('/api/users/:_id/exercises', async (req, res) => {
  // Extract data: _id, description, duration, date from URL or form using req.something
  const { _id } = req.params;  // User ID from URL
  const { description, duration, date } = req.body;  // Form fields

  // Validate required fields before DB calls
  if(!description || !duration) {
    return res.status(400).json({ error: "Description and Duration are both required" });
  };

  if(isNaN(duration) || duration <= 0) {
    return res.status(400).json({ error: "Duration must be a positive number" });
  }

  // Try/catch
  try {
    // Find the user by _id, if not found respond with an error message
    const user = await User.findById(_id);
    if(!user) {
      return res.status(404).json({ error: "User not found" });
    };

    // If date is supplied but it's invalid, reject it with a returned message error response
    const dateStr = req.body.date?.trim();
    let exerciseDate = new Date();

    if(dateStr) {
      exerciseDate = new Date(dateStr);
      if(exerciseDate.toString() === "Invalid Date") {
        return res.status(400).json({ error: "Invalid date format"})
      }
    };

    // Build the exercise object (store real Date, not string)
    const exercise = {
      description: description.trim(),
      duration: Number(duration),
      date: exerciseDate
    };

    // Add the exercise to the user's log array
    user.log.push(exercise);

    // Save the updated user back to MongoDB (don't forget the await)
    await user.save();

    // Response: format date ONLY when sending
    res.json({
      _id: user._id,
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exerciseDate.toDateString()  // fCC requires this exact format
    });
  
  // Catch with response  
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error"})
  };


});

// ──────────── Get a user's full log (GET /api/users/:_id/logs) ────────────

app.get('/api/users/:_id/logs', async (req, res) => {
  // Find the user; if not found return json
  try {
    const user = await User.findById(req.params._id);
    if(!user) return res.status(404).json({error: 'User not found'});
    // Make a copy of the log to avoid mutating the original
    let log = [...user.log];

    // FROM filter - Handle ?to and ?from query parameters (yyyy-mm-dd)
    const fromStr = req.query.from?.trim();
      if(fromStr) {
        const from = new Date(fromStr);

        if(from.toString() !== 'Invalid Date') {
          log = log.filter(exercise => exercise.date >= from);
        }
      };

    // TO filter — make it inclusive of the entire day
    const toStr = req.query.to?.trim();
      if(toStr) {
        const to = new Date(toStr);

        if(to.toString() !== 'Invalid Date') {
          to.setUTCHours(23, 59, 59, 999);  // End of day
          log = log.filter(exercise => exercise.date <= to);
        }
      };

    // Handle ?limit
    const limit = req.query.limit ? Number(req.query.limit) : null;
    if(limit && !isNaN(limit) && limit > 0) {
      log = log.slice(0, limit);
    };

    // Map response output & format date (fCC wants strings)
    const formattedLog = log.map(ex => ({
      description: ex.description,
      duration: ex.duration,
      date: ex.date.toDateString()
    }));

    // Final json response (user id, username, count of logs, log (formatted log))
    res.json({
      _id: user._id,
      username: user.username,
      count: formattedLog.length,
      log: formattedLog
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Server Error'});
    
  };
  
});

// ──────────────────────────────────────────────────────────────
// 5. START SERVER — Always present
// ──────────────────────────────────────────────────────────────
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});

