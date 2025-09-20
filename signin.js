const bcrypt = require("bcryptjs");
const jwt=require("jsonwebtoken");
const express=require("express");
const auth=require('./auth')
const {user,driver}=require("./Shema/shemas")
const route=express.Router();
const KEY="VanakkamdaMappla"


//user//
route.post('/check',async(req,res)=>{
    try{
        const mail=(req.body.email).trim();
        let phone;
        if(req.body.phone)
        {
        phone=Number(req.body.phone);
        }
        const all=await user.find({$or:[{email:mail},{phone:phone}]});
        console.log(all);
        if(all.length>0){
        if(all[0].email==mail){
          res.send("Email already exits")
        }
        else if(all[0].phone==phone){
          res.send("Phone Number already exits");
        }
      }
        else{
          res.send("ok")
        }
        }
    catch(error){
        console.log("Errorrr:",error);
    }
})

const saltRounds = 10;
route.post('/signin',async(req,res)=>{
    try{
    const hash=await bcrypt.hash(req.body.pass,saltRounds);
    delete req.body.pass;
    const data={...req.body,password:hash};
    const result=await user.create(data);
    if(result){
      const token=jwt.sign({email:req.body.email,name:result.name,id:result._id},process.env.JWT_SECRET,{expiresIn:"7d"});
    res.send({message:"Inserted",token:token})
    }
}
catch(err){
    console.log("Find error:",err)
    res.json({body:"There is error here"});
}
});

route.post('/passupdate',async(req,res)=>{
  try{
    const{pass,confpass,email}=req.body;
    const hash=await bcrypt.hash(pass,saltRounds);
    const result=await user.updateOne({email:email},{$set:{password:hash}})
    if(result.matchedCount===0){
      res.send({message:"Some Network error"})
    }
    res.send({message:"success"})
  }
  catch(err){
    res.json({body:"There is error here"});
  }
})
//user//


//driver
route.post('/drivercheck',async(req,res)=>{
    try{
        const mail=(req.body.email).trim();
        let noplate;
        let phone;
        if(req.body.phone)
        {
        phone=Number(req.body.phone);
        }
        if(req.body.numberplate){
          noplate=req.body.numberplate;
        }
        const all=await driver.find({$or:[{email:mail},{phone:phone},{numberplate:noplate}]});
        if(all.length>0){
        if(all[0].email==mail){
          res.send("Email already exits")
        }
        else if(all[0].phone==phone){
          res.send("Phone Number already exits");
        }
        else if(all[0].numberplate==noplate){
          res.send("Number plate already exits");
        }
      }
        else{
          res.send("ok")
        }
        }
    catch(error){
        console.log("Errorrr:",error);
    }
})

route.post('/driversignin',async(req,res)=>{
    try{
    const hash=await bcrypt.hash(req.body.pass,saltRounds);
    delete req.body.pass;
    const data={...req.body,password:hash};
    const result=await driver.create(data);
    if(result){
      const token=jwt.sign({email:req.body.email,name:req.body.name,id:result._id},process.env.JWT_SECRET,{ expiresIn: "7d" });
    res.send({message:"Inserted",token:token})
    }
}
catch(err){
    res.json({body:"There is error here"});
}
});


route.post('/driverpassupdate',async(req,res)=>{
  try{
    const{pass,email}=req.body;
    const hash=await bcrypt.hash(pass,saltRounds);
    const result=await driver.updateOne({email:email},{$set:{password:hash}})
    console.log("Result",result);
    if(result.matchedCount===0){
      res.send({message:"Some Network error"})
    }
    else{
    res.send({message:"success"})
    }
  }
  catch(err){
    res.json({body:"There is error here"});
  }
})

//driver//



module.exports=route;


