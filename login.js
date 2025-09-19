const bcrypt = require("bcryptjs");
const {cors,app,nodemail}=require("./mainserver");
const jwt=require("jsonwebtoken");
const express=require("express");
const auth=require('./auth')
const {user,driver}=require("./Shema/shemas")
const logroute=express.Router();
const KEY="VanakkamdaMappla"


//user//
logroute.post('/login',async(req,res)=>{
    try{
        const {email,pass}=req.body;
        const find=await user.findOne({email:email});
        if(find!=null){
            const match=await bcrypt.compare(pass,find.password);
            if(match){
            const token=jwt.sign({email:req.body.email,name:find.name,id:find._id,phone:find.phone},process.env.JWT_SECRET,{expiresIn:"7d"});
            res.send({message:"success",token:token});
            }
            else 
            {
                res.send({message:"Invalid Password"})
            }
        }
        else{
            res.send({message:"Invalid user"})
        }
    }
    catch(err){
        console.log(err);
    }
})


//driver//
logroute.post('/driverlogin',async(req,res)=>{
    try{
        const {email,pass}=req.body;
        const find=await driver.findOne({email:email});
        if(find!=null){
            const match=await bcrypt.compare(pass,find.password);
            if(match){
            const token=jwt.sign({email:req.body.email,name:find.name,id:find._id,phone:find.phone},process.env.JWT_SECRET,{expiresIn:"7d"});
            res.send({message:"success",token:token});
            }
            else 
            {
                res.send({message:"Invalid Password"})
            }
        }
        else{
            res.send({message:"Invalid user"})
        }
    }
    catch(err){
        console.log(err);
    }
})



module.exports=logroute;
