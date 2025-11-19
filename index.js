const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/user')

app.use(cors())


// Parse URL-encoded bodies (for form data)
// This is essential for POST requests with form data
// changes urlencoded data (username=john&description=running&duration=30) to js object
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
  const users = await User.find({}).select('username _id');
  
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
