const express = require('express');
const app = express();
const {User} = require('./model/User');
const mongoose = require('mongoose');
const bcrypt = require ('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const morgan = require('morgan');







//connecting to database
mongoose.connect('mongodb://127.0.0.1:27017/shopyEcom')
.then(()=>{
    console.log('connected to the database');
}).catch((err)=>{
    console.log('database is not connected ',err);
})

//middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'))

//task1 create a register route
app.post('/register',async(req,res)=>{
    try{
         const {name,email,password} = req.body;
         //check is any field missing
         if(!name || !email || !password){
            return res.status(400).json({message:'some fields are missing'})
         }  
         //check if user already exists
         const isUserAlreadyExists = await User.findOne({email});
         if(isUserAlreadyExists){
            return res.status(400).json({message:'user already exists'})
         }
         else{
            //hasting  the password
            const salt = await bcrypt.genSaltSync(10);
            const hashedPassword = await bcrypt.hashSync(password,salt);

            //jwt token
            const token = jwt.sign({email},'supersecret',{expiresIn:'356d'});
            //creating new user
            await User.create({
                name,
                email,
                password :hashedPassword,
                token,
                role:'user'
            })
            return res.status(201).json({message :'user created successfully'})
        } 
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'internal server error'})
        }
    
})
//task2 create a login route
app.post('./login',async(req,res)=>{
    try{
    const {email,password} = req.body;
//check if any field missing
if(!email || !password){
    return res.status(400).json({message:'some filed are missing'})
}
//user exites
const user = await User.findOne({email});
if(!user){
    return res.status(400).json({message:'user dose not exits.'})
}
//compair the entered with the hashed password
const isPasswordMatched = await bcrypt.compareSync(password,user.password);
if(isPasswordMatched){
    return res.status(200).json({message:'Password is incorrect'});
}

//successfully logged
return res.status(200).json({
    message:'user logged in successfully',
    id:user._id,
    name:user.name,
    email:user.email,
    token:user.token,
    role:user.role
})

}catch(error){
    console.log(error);
    return res.status(500).json({message:'internal server error'})
    }

})







const PORT = 8080;
app.listen(PORT,()=>{
    console.log(`Server is connected to port ${PORT}`);
})

