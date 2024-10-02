const mongoose = require('mongoose')

const withdrawalRequestSchema = new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    date:{type:Date,required:true},
    amount:{type:Number,required:true},
    paid:{type:Boolean,default:false},
    paidOn:{type:Date,required:false},
    paymentProof:{type:String,required:false}
})

const WithdrawalRequest = mongoose.model('WithdrawalRequest',withdrawalRequestSchema)

module.exports = WithdrawalRequest