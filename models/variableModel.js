const mongoose = require('mongoose');

const variableSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // Name of the variable
  value: { type: mongoose.Schema.Types.Mixed, required: true }, // Value of the variable (can be of any type)
  createdAt: { type: Date, default: Date.now } // Optional: store when the variable was created
});

// Create the model
const Variable = mongoose.model('Variable', variableSchema);

module.exports = Variable;