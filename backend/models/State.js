// backend/models/State.js
const mongoose = require('mongoose');

const StateSchema = new mongoose.Schema({
  stateId: {
        type: String,
        required: true,
    unique: true
    },
    name: {
        type: String,
    required: true
    },
    description: {
        type: String,
        required: true
    },
  capital: {
    type: String
  },
  // Add more fields as needed, e.g., image, famous places, etc.
  famousPlaces: [
    {
      name: String,
      description: String,
      imageUrl: String  
    }
  ],
  climate: String
});

module.exports = mongoose.model('State', StateSchema);