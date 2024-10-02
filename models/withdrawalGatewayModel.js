const mongoose = require('mongoose')

const WithdrawalGatewaySchema=new mongoose.Schema({
    dollarValue:{type:Number,required:true},
    conversionCharge:{type:Number,required:false,default:0},
    transactionCharge:{type:Number,required:false,default:0},
    deadline:{type:Date,required:false}
})

const WithdrawalGateway = mongoose.Schema('WithdrawalGateway',WithdrawalGatewaySchema);
module.exports = WithdrawalGateway