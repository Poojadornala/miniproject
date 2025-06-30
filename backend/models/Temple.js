// backend/models/Temple.js
const mongoose = require('mongoose');

const templeSchema = new mongoose.Schema({
  templeId: String, // Add this field to match the URL parameter
  name: String,
  description: String,
  imageUrl: String,
  history: String,
  festivals: String,
    locationDetails: {
    location: String,
    state: String,
    country: String,
    deity: String
    },
    mapCoords: {
    latitude: Number,
    longitude: Number
  },
  slokam: {
    verse: String,
    text: String,
    transliteration: String,
    translation: String,
    audioUrl: String
  },
  website: String
});

module.exports = mongoose.model('Temple', templeSchema, 'temples'); // Use 'temples' collection