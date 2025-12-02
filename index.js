const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/user')

app.use(cors())


//==== Parse URL-encoded bodies (for form data) ============
//=== This is essential for POST requests with form data ===
//== changes urlencoded data (username=john&description=running&duration=30) to js object ===
app.use(express.urlencoded({ extended: true}))

app.use(express.json())

app.use(express.static('public'))

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

let count = 0;

app.get('/', (req, res) => {
  console.log("Homepage hit: ", count++);

  res.sendFile(__dirname + '/views/index.html')
});

// === Console logs to review request data ======
app.use((req, res, next) => {
  console.log({
    path: req.path,
    params: req.params,
    query: req.query,
    body: req.body,
    headers: req.headers,
  });
  next();
});


//=========== Create & Post users ================
app.post('/api/users', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const user = new User({ username });

  try {
    const savedUser = await user.save();
    res.json({ username: savedUser.username, _id: savedUser._id });
  } catch (error) {
    console.error('Save failed: ', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    return res.status(500).json({ error: 'Server error' });
  }
});

//========= Get All users ================
app.get('/api/users', async (req, res) => {
  const { username, _id } = req.body;

  try {
    const users = await User.find({}).select('username _id');
    res.json(users);

  } catch (error) {
    console.error('Error: ', error);
    return res.status(500).json({ error: 'Server error'});
  }
  
  
});

//========= Add Exercise ================
app.post('/api/users/:_id/exercises', async (req, res) => {
  // 1. Extract data: _id, description, duration, date from URL or form using req.something
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  // 2. Validate required fields before DB calls
  if(!description || !duration) {
    return res.json({ error: "Description and Duration are both required" });
  };

  if(isNaN(duration) || duration <= 0) {
    return res.json({ error: "Duration must be a positive number" });
  }

  // Trycatch
  try {
    // 3. Find the user by _id, if not found respond with an error message
    const user = await User.findById(_id);
    if(!user) {
      return res.json({ error: "User not found" });
    };

    // 4. If date is supplied but it's invalid, reject it with a returned message error response
    const dateStr = req.body.date?.trim();
    let exerciseDate = new Date();

    if(dateStr) {
      exerciseDate = new Date(dateStr);
      if(exerciseDate.toString() === "Invalid Date") {
        return res.json({ error: "Invalid date format"})
      }
    }

    // 5. Build the excercise object
    const exercise = {
      description: description.trim(),
      duration: Number(duration),
      date: exerciseDate.toString()
    }

    // 6. Add the exercise to the user's log array
    user.log.push(exercise);

    // 7. Save the updated user back to MongoDB (don't forget the await)
    await user.save();

    // 8. Send back the response freecodecamp expects
    res.json({
      _id: user._id,
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date
    });
  
  // 9. Catch with response  
  } catch (error) {
    console.error(error);
    res.json({ error: "Server error"})
  }


});

// =========== Get a user's full log (GET /api/users/:_id/logs) ==============
app.get('/api/users/:_id/logs', async (req, res) => {
  
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});

