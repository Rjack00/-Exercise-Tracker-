
const express = require('express');
const app = express();

app.disable('x-powered-by');

const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

app.use(cors());  
app.use(express.urlencoded({ extended: true}));


app.use(express.json());  

app.use(express.static('public'));

// Startup validation
if(!process.env.MONGO_URI) {
  console.error('MONGO_URI is missing in .env');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI) 
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('Database connection failed: ', err);
    process.exit(1);
  });

// Helper functions
const parseLocalDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date =  new Date(year, month -1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return new Date("invalid");
  }

  return date;
};

// ROUTES
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// ──────────────────── Create & Post users ────────────────────

app.post('/api/users', async (req, res) => {
  const { username } = req.body;

  if (!username || username.trim() === "") {
    return res.status(400).json({ error: 'Username is required' });
  }

  const user = new User({ username });

  try {
    const savedUser = await user.save();
    res.json({ username: savedUser.username, _id: savedUser._id });
  } catch (error) {
    
    if (error.code === 11000) {   // Duplicate key error
      return res.status(400).json({ error: 'Username already taken' });  
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid username' });
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
    return res.status(500).json({ error: 'Server error'});
  }
  
  
});

// ────────────────────── Add Exercise ──────────────────────

app.post('/api/users/:_id/exercises', async (req, res) => {
  const { _id } = req.params;  
  const { description, duration, date } = req.body; 

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  // Validate required fields before DB calls
  if(!description || description.trim() === "" || duration === undefined) {
    return res.status(400).json({ error: "Description and Duration are both required" });
  }

  if(isNaN(duration) || duration <= 0) {
    return res.status(400).json({ error: "Duration must be a positive number" });
  }

  try {
    const user = await User.findById(_id);
    if(!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const dateStr = req.body.date?.trim();
    let exerciseDate = new Date();

    if(dateStr) {
      exerciseDate = parseLocalDate(dateStr);
      if(exerciseDate.toString() === "Invalid Date") {
        return res.status(400).json({ error: "Invalid date format"})
      }
    }

    // Store the exercise date as a Date object.
    const exercise = {
      description: description.trim(),
      duration: Number(duration),
      date: exerciseDate
    };

    user.log.push(exercise);

    await user.save();

    // Format the date only when sending the response.
    res.json({
      _id: user._id,
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exerciseDate.toDateString()  // FCC required this format
    });
  
  } catch (error) {

    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: "Invalid exercise data"})
    }

    res.status(500).json({ error: "Server error"})
  }


});

// ──────────── Get a user's full log (GET /api/users/:_id/logs) ────────────

app.get('/api/users/:_id/logs', async (req, res) => {
  
  if(!mongoose.Types.ObjectId.isValid(req.params._id)) {
    return res.status(400).json({ error: 'Invalid user ID' })
  }
  
  try {
    const user = await User.findById(req.params._id);
    if(!user) return res.status(404).json({error: 'User not found'});
    // Make a copy of the log to avoid mutating the original
    let log = [...user.log];

    // Filter by start date
    const fromStr = req.query.from?.trim();

    if(fromStr) {
      const from = parseLocalDate(fromStr);

      if(from.toString() === 'Invalid Date') {
        return res.status(400).json({ error: "Invalid from date" })
      }

      log = log.filter(exercise => exercise.date >= from);
    }

    // TO filter — make it inclusive of the entire day
    const toStr = req.query.to?.trim();

    if(toStr) {
      const to = parseLocalDate(toStr);
      
      if(to.toString() === 'Invalid Date') {
        return res.status(400).json({ error: "Invalid to date" })
      }

      to.setHours(23, 59, 59, 999);  // End of day
      log = log.filter(exercise => exercise.date <= to);
    }

    const limit = req.query.limit;
    
    if (limit !== undefined) {
      const limitNumber = Number(limit);

      if(isNaN(limitNumber) || limitNumber < 1) {
      return res.status(400).json({ error: "Invalid limit" });
    }

    log = log.slice(0, limitNumber);

    }

    // Format dates for the API response.
    const formattedLog = log.map(ex => ({
      _id: ex._id,
      description: ex.description,
      duration: ex.duration,
      date: ex.date.toDateString()
    }));

    
    res.json({
      _id: user._id,
      username: user.username,
      count: formattedLog.length,
      log: formattedLog
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
    
  }
  
});


// ────────────────────── UPDATE EXERCISE ──────────────────────

app.put('/api/exercises/:exerciseId', async (req, res) => {
  try {
    const { exerciseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(exerciseId)) {
       return res.status(400).json({
         error: "Invalid exercise ID"
       });
    }

    const user = await User.findOne({
      "log._id": exerciseId
    });
    
    if (!user) {
      return res.status(404).json({
        error: "Exercise not found"
      });
    }

    const exercise = user.log.id(exerciseId);

    const { description, duration, date } = req.body;

    if (
      !description || 
      description.trim() === "" ||
      duration === undefined || 
      !date
    ) {
      return res.status(400).json({
        error: "Description, duration, and date are required"
      });
    }

    if (isNaN(duration) || Number(duration) <= 0) {
      return res.status(400).json({
        error: "Duration must be a positive number"
      });
    }

    const exerciseDate = parseLocalDate(date);

    if (exerciseDate.toString() === "Invalid Date") {
      return res.status(400).json({
        error: "Invalid date format"
      });
    }

    exercise.description = description.trim();
    exercise.duration = Number(duration);
    exercise.date = exerciseDate;

    await user.save();

    res.json({
      message: "Exercise updated successfully.",
      exercise: {
        _id: exercise._id,
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString()
      }
    });

  } catch (error) {

    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: "Invalid exercise data"});
    }

    res.status(500).json({ error: 'Server error' });
  }
});

// ────────────────────── DELETE EXERCISE ──────────────────────

app.delete('/api/exercises/:exerciseId', async (req, res) => {
  try {

    const { exerciseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(exerciseId)) {
       return res.status(400).json({
         error: "Invalid exercise ID"
       });
    }

    const user = await User.findOne({
      "log._id": exerciseId
    });
    
    if (!user) {
      return res.status(404).json({
        error: "Exercise not found"
      });
    }

    const exercise = user.log.id(exerciseId);

    await exercise.deleteOne();

    await user.save();

    res.json({
      success: true,
      message: "Exercise successfully deleted."
    });

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});


// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});


// Start server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server listening on port ${listener.address().port}`);
});

