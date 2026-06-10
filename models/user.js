const mongoose = require('mongoose')

const exerciseSchema = new mongoose.Schema({
  description: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  duration: { 
    type: Number, 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
});

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    maxlength: 30 
  },
  log: [exerciseSchema]
});

module.exports = mongoose.model('User', userSchema);