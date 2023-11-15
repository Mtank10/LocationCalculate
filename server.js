const express = require('express')
const app = express()
const dotenv = require('dotenv')

const dbConfig = require('./config/dbConfig')

const userRoute = require('./routes/userRoute')
dotenv.config();

//connection to database;
dbConfig();

app.use(express.json());
app.use('/api',userRoute);



//Create server to listen on port 3000
app.listen(process.env.PORT,()=>{
    console.log(`server connect on port no ${process.env.PORT}`)
})