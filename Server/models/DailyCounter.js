const mongoose = require('mongoose');

const DailyCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Date in 'YYYY-MM-DD' format
  seq: { type: Number, default: 0 }
});

module.exports = mongoose.model('DailyCounter', DailyCounterSchema);
