const jwt=require("jsonwebtoken");
const express=require("express");
const auth=require('./auth');
const KEY='VanakkamdaMappla';
const {user,driver,ride}=require("./Shema/shemas")
const route=express.Router();
//user//
route.get("/userdata",auth,async(req,res)=>{
    try{
        const id=req.user.id;
        const d=await ride.find({rider:id}).populate('rider').populate('driver');
        if(d){
        res.send(d);
        }
        else{
            res.send("Invalid user")
        }
    }
    catch(err){

    }
});

route.get("/userd",auth,async(req,res)=>{
    try{
        const id=req.user.id;
        const d=await user.findOne({_id:id});
       
        if(d){
            
        res.send(d);
        }
        else{
            res.send("Invalid user")
        }
    }
    catch(err){
        res.send("some time went wrong")
    }
});

route.post("/userup",auth,async(req,res)=>{
    try{
        const {name,phone}=req.body;
        const u=await user.findOneAndUpdate({_id:req.body._id},{$set:{name,phone}},{ new: true });
        if(!u){
            return res.send("User Not found")
        }
        else{
            const token=jwt.sign({email:u.email,name:u.name,id:u._id,phone:u.phone,role:u.role},KEY,{expiresIn:"7d"});
            res.send({message:"success",token:token});
            
        }
    }
    catch(err){
    res.send("some time went wrong")
    }
});

//driver//

route.get("/ridedata",auth,async(req,res)=>{
    try{
        const id=req.user.id;
        const d=await ride.find({driver:id}).populate('rider').populate('driver');
        if(d){
        res.send(d);
        }
        else{
            res.send("Invalid user")
        }
    }
    catch(err){

    }
});
route.get("/driverdata",auth,async(req,res)=>{
    try{
        const id=req.user.id;
        const d=await driver.findOne({_id:id});
        console.log("driv",d);
        if(d){
            
        res.send(d);
        }
        else{
            res.send("Invalid user")
        }
    }
    catch(err){

    }
});

route.get("/driverd",auth,async(req,res)=>{
    try{
        const id=req.user.id;
        const d=await driver.findOne({_id:id});
        if(d){
            
        res.send(d);
        }
        else{
            res.send("Invalid user")
        }
    }
    catch(err){
        res.send("some time went wrong")
    }
});

route.post("/driverup",auth,async(req,res)=>{
    try{
        const {name,phone,address,worklocation}=req.body;
        const u=await driver.findOneAndUpdate({_id:req.body._id},{$set:{name,phone,address,worklocation}},{ new: true });
        if(!u){
            return res.send("User Not found")
        }
        else{
            const token=jwt.sign({email:u.email,name:u.name,id:u._id,phone:u.phone,role:u.role},KEY,{expiresIn:"7d"});
            res.send({message:"success",token:token});
            
        }
    }
    catch(err){
        console.log(err);
    res.send("some time went wrong")
    }
});



module.exports=route;
