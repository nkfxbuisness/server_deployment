const bcrypt = require("bcryptjs");
const { default: mongoose } = require("mongoose");

const depositSchema = new mongoose.Schema({
    depositAmount:{type:Number,required:false},
    octaDepositReqNo:{type:String,required:false},
    depositReceiptUrl:{type:String,required:false},
    depositDate:{type:Date,required:false}
})

const comissionCreditSchema = new mongoose.Schema({
  amount:{type:Number,required:false},
  date:{type:Date,required:true}
})

const userSchema = new mongoose.Schema({
    name:{type : String , required : true},
    email : {type:String,required:true , unique: true, index: true },
    mobileNo:{type:Number,required :true , unique: true},
    DOB:{type:Date,required :true},
    address:{type:String,required:true},
    accountNo:{type:String,required:true},
    IFSCcode:{type:String,required:true},
    bank:{type:String,required:true},
    PANno:{type:String,required:true},
    PANcardUrl:{type:String,required:false},
    aadhaarNo:{type:Number,required:true},
    aadhaarCardUrl:{type:String,required:false},
    password:{type:String,required:true},
    copyProportion:{type:Number,required:true,default:1},
    parent:{type:mongoose.Schema.Types.ObjectId,ref:"Admin" , index: true },
    path: { type: String, default: null },  // Materialized path to store the path from the root to this node
    referralCode:{type:String,required:true},

    activationStatus: {
      active: { type: Boolean, default: false },
      activeOn: { type: Date, required: false },
      activationRequestSubmitted: { type: Boolean, default: false },
      requestRejected: { type: Boolean, default: false},
      rejectionRemarks: { type: String, required: false },
      suspended: { type: Boolean, default: false }
    },

    initialDepositDetails: {
      octaDepositReqNo: { type: String, required: false },
      regFeesReciptUrl: { type: String, required: false },
      regFeesTransactionId: { type: String, required: false },
      regFeesPaymentDate: { type: Date, required: false }
    },

    walletBalance:{type:Number,default:0},
    depositData:[depositSchema],
    creditData:[comissionCreditSchema],
    withdrawalRequests:[{type:mongoose.Schema.Types.ObjectId,ref:"WithdrawalRequest"}],
    withdrawalRequestSubmitted:{type:Boolean,default:false},
    role:{type:String , default:"user"}
    },
    { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {  // Make sure this is correctly checking the password
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;