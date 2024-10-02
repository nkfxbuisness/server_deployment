const mongoose = require('mongoose');

const profitSchema = new mongoose.Schema({
    masterProfit:{type:Number,required:true},
    date:{type:Date,required:true}
},{timestamps:true})

const Profit = mongoose.model('Profit',profitSchema);
module.exports = Profit;