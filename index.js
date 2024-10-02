// import all packages 
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors')


// import files 
const connectDB = require('./config/db/DBconnection');

// import routes 
const userRoures = require('./routes/userRoutes')
const adminRoutes = require('./routes/adminRoutes')
const authRoutes = require('./routes/authRoutes')
const testRoutes = require('./routes/testRoutes')
// const generateUploadURL=require("./config/s3")

// initialize 
const app = express();
app.use(cors())
app.use(express.json());
dotenv.config();
connectDB();

// routes 
app.use('/api/user',userRoures)
app.use('/api/admin',adminRoutes)
app.use('/api/auth',authRoutes)
app.use('/api/test',testRoutes)
// app.get('/api/test/test1',(req, res) => {
//     res.send('User');
// })


app.get("/",(req,res)=>{
    res.send("Server is running ");
})
// app.get('/s3Url', async (req, res) => {
//     const url = await generateUploadURL()
//     res.send({url})
// })

app.get("*", (req, res) => {
    res.status(404).json({
        success:false,
        message: "This route does no exist",
    });
  });

const PORT = process.env.PORT;

app.listen(4000,console.log(`Server listining on ${PORT}`));