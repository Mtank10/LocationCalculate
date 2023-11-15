const bcrypt = require('bcryptjs')
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
var haversine = require("haversine-distance");
require('dotenv').config()
async function createNewUser(req,res){
    try{
        const {
            name,
            email,
            password,
            address,
            latitude,
            longitude,
            week_number
        } = req.body;

        //check if email already exists
        const exitUser = await User.findOne({email});
        if(exitUser){
            return res.status(400).json({error:'Email already exists'});
        }
        if(!isValidEmail(email)){
            return res.status(400).json({error:'Email must be in format'});
        }
        if(password.length<6){
            return res.status(400).json({error:'Password must be more than 6 chracters'});
        }
        
        //Encrypt password
        const hashedPassword = await bcrypt.hash(password,10);
        const user = User({
            name,
            email,
            password:hashedPassword,
            address,
            latitude,
            longitude,
            week_number,
        })
        const savedUser = await user.save();
        const response = {
            status_code:'200',
            message:'User create successfully',
            data:savedUser,
        }
        
        res.status(200).json(response)

    }catch(err){
        res.status(500).json({status_code:'500',message:'Internal Server Error'})
    }
}

async function login(req,res){
    try{
    const {email,password} = req.body;

    const user = await User.findOne({email});
    if(!user){
        return res.status(401).json({message:"Invalid email or password"});
    }

    const isPasswordValid = await bcrypt.compare(password,user.password)
    if(!isPasswordValid){
        return res.status(401).json({message:'Invalid email and password'});
    }
     
    const accessToken = jwt.sign({email:user.email},process.env.JWT_SECRET_KEY,{ expiresIn: '1h' });
    res.json({
        message:'login successfull',
        accessToken
    })

  }catch(err){
    res.status(500).json({error:"Internal server error"});
  }

}





async function handleChangeStatus(req,res){
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET_KEY);
    
        if (!decodedToken) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
    
        const users = await User.find({});
    
        const updatedUsers = await Promise.all(
          users.map(async (user) => {
            user.status = user.status === 'active' ? 'inactive' : 'active';
            return user.save();
          })
        );
    
        res.status(200).json({ status_code:'200',message: 'All users status changed successfully' });
      }
    catch(err){
        res.status(400).json({error:'connect access without token key'});
    }
}

//calculate distance between two coordinates

async function calculateDistance(req,res){
    try{
        const {destination_latitude,destination_longitude} = req.query;
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET_KEY);
        const email = decodedToken.email;
        const user = await User.findOne({email});
        var point1 = { lat: user.latitude, lng: user.longitude }

        //Second point in your haversine calculation
        var point2 = { lat: destination_latitude, lng: destination_longitude }

        var distance_meter = haversine(point1, point2); //Results in meters (default)
        var distance_km = distance_meter /1000; //Results in kilometers
        const response = {
            status_code:'200',
            message:"Distance between two points",
            distance:Math.round(distance_km)+"km"
        }
        res.status(200).json(response);
        
    }catch(err){
        res.status(400).send({err:err.message});
    }
}


async function handleWeek_Wise_User(req,res){
    try{
        const usersByWeekdays={};
        for(let i=0;i<7;i++){
            const users = await User.find({week_number:i});

            const day = getDayName(i);
            usersByWeekdays[day] = users.map(user=>({name:user.name,email:user.email}))
        }
        res.status(200).json({
            status_code:'200',
            message:'User list grouped by weekdays',
            data:usersByWeekdays
        });
    }catch(err){
        res.status(500).json({error:'internal server error'});
    }
}
//function to get day name based on day index
function getDayName(dayIndex){
    const days = ['sunday','monday','tuesday','wednesday','thrusday','friday','saturday'];
    return days[dayIndex];
}

function isValidEmail(email){
    const emailRegex = /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/;
    return emailRegex.test(email);
}

module.exports = {
    createNewUser,
    handleChangeStatus,
    login,
    calculateDistance,
    handleWeek_Wise_User
}