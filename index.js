const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')

app.use(cors())


// Parse URL-encoded bodies (for form data)
// This is essential for POST requests with form data
// changes urlencoded data (username=john&description=running&duration=30) to js object
app.use(express.urlencoded({ extended: false}))

app.use(express.json())

app.use(express.static('public'))

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const exerciseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  log: [exerciseSchema]
});

module.exports = mongoose.model('User', userSchema);





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
