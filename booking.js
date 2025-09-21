const bcrypt = require("bcryptjs");
const jwt=require("jsonwebtoken");
const KEY='VanakkamdaMappla';
const {cors,app,nodemail}=require("./mainserver");
const express=require("express");
const http = require("http");
const { Server } = require("socket.io");
const {user,driver,ride,payment,rating}=require("./Shema/shemas");
 
const connectedDriver={};
const connectedUser={};
const preride={};
let rideoffer={};
module.exports=(io)=>{
    io.use((socket,next)=>{
        const token=socket.handshake.auth.token;
        if(!token){
            return next(new Error("token Missing"));
        }
        jwt.verify(token,KEY,(err,decoded)=>{
            if(err){
                return next(new Error("Invalid Token"))
            }
            socket.user=decoded;
            next();
        })
})
    io.on("connection",(socket)=>{
    console.log("New connection",socket.id);

socket.on("driver:register",async({driverId})=>{
    try{
        connectedDriver[driverId]=socket.id;
        socket.driverId=driverId
        const d=await driver.findByIdAndUpdate(driverId,{socketId:socket.id},{ new: true });
        if(!d) return;
    }
    catch(err){
        console.log("Error here",err)
        io.emit("there is an error")
    }

});

socket.on("user:register",async(userId)=>{
    try{
        console.log(userId);
        const u=await user.findById(userId);
        if(!u)return;
        connectedUser[userId]=socket.id;
        console.log("USer connect",userId,socket.id)
    }
    catch(err){
        console.log("Error user",err);
        io.emit("There is an error");
    }
})

socket.on("ride:request",async(data)=>{
    const userId=data.rider;
    const vehical=data.vehical;
    delete data.vehical;
    const up={...data};
    const ridee=await ride.create(up);
    const drivers=await driver.find({vehicaltype:vehical,socketId:{$ne:null}});
    if(drivers.length==0){
        const requser=connectedUser[userId]
        io.to(requser).emit("no-drivers",{message:"Drivers Not avaliable"});
        delete rideoffer[ridee._id]
        return;
    }
    rideoffer[ridee._id]= drivers.map(d=>d.socketId);
    sendToNextDriver(ridee._id.toString(),userId);
});
 
let c=false;
socket.on("ride:cancel",async(data)=>{ 
    const can=await ride.findOneAndDelete({rider:data,status:"pending"});
    if(can){
         const rideid=can._id.toString();
    const userid=connectedUser[data];
    io.to(userid).emit("ride:cancled",{message:"cancled_success"});
    const driver=preride[rideid];
    io.to(driver).emit("ride:cancled",rideid);
    c=true
    delete rideoffer[rideid];
     sendToNextDriver(rideid,data);
    }
})



socket.on("ride:timecancel",async(data)=>{
    const can=await ride.findOneAndUpdate({rider:data,status:"accepted"},{$set:{status:"cancelled"}});
    if(can){
         const rideid=can._id.toString();
    const userid=connectedUser[data];
    io.to(userid).emit("ride:timecancled",{message:"cancled_success"});
    const driver=preride[rideid];
    io.to(driver).emit("ride:timecancled",{message:"timecancle"});
    c=true
     sendToNextDriver(rideid,data);
    }
})




async function sendToNextDriver(rideId,userId){
    const drivers=rideoffer[rideId];
    const Ridedoc=await ride.findOne({_id:rideId}).populate('rider','name phone ').lean();
    if(!drivers || drivers.length==0){
        if(!c){
            const userid=connectedUser[userId];
        io.to(userid).emit("no-drivers",{message:"Drivers Not avaliable",rideId});
        const can=await ride.findByIdAndDelete(rideId);
        }
        delete rideoffer[rideId];
         return;
    }
    const driversocketid=drivers.shift();
    preride[rideId]=driversocketid;
    rideoffer[rideId]=drivers;
    io.to(driversocketid).emit("ride:offer",Ridedoc);
}

socket.on("ride:confirm",async(data)=>{
      const rideconf=await ride.findOneAndUpdate({_id:data.r,status:"pending"},{driver:data.d,status:"accepted"},{ new: true }).populate('driver','name phone').lean();
      if(rideconf){
        const usersocketid=connectedUser[rideconf.rider.toString()]
          io.to(usersocketid).emit("ride:accepted",rideconf);
      }
      else{
          socket.emit("ride:already_taken",data.rideId);
      }
  });

socket.on("ride:reject",(or) => {
    const {d,r,u}=or;
    sendToNextDriver(r,u);
  });


socket.on("ride:process",async(data)=>{
    
    const up=await ride.findOneAndUpdate({_id:data},{$set:{status:"process"}});
    
    const driver=connectedDriver[up.driver.toString()];
    io.to(driver).emit("ride:va",{message:"success"})
});

socket.on("getuser:data",async(data)=>{
    
    const get=await ride.findOne({rider:data,status:"process"}).populate('driver','name phone').lean();
    const user=connectedUser[data];
    io.to(user).emit("user:vaa",get);
})

socket.on("getdriver:data",async(data)=>{
    const get=await ride.findOne({driver:data,status:"process"}).populate('rider','name phone email').lean();
    const driver=connectedDriver[data];
    io.to(driver).emit("driver:vaa",get);
});

socket.on("driver:complete",async(data)=>{
    const{userId,driverId}=data;
    const get=await ride.findOneAndUpdate({rider:userId,driver:driverId,status:"process"},{$set:{status:'completed'}});
    if(get){
        const pay=await payment.create({
            ride:get._id.toString(),
            rider:userId,
            driver:driverId,
            amount:get.fare
        })
        if(pay){
    const user=connectedUser[userId.toString()];
    const driver=connectedDriver[driverId.toString()];
    io.to(user).emit("completed",{message:"completed"});
    io.to(driver).emit("ride:completed",{message:"completed"})
        }
    }
})

socket.on("rating",async(data)=>{
    const{userId,driverId,rate,ride}=data;
    const r=await rating.create({
        ride:ride.toString(),
        rider:userId,
        driver:driverId,
        rating:rate.rating,
        comment:rate.comment
    })
    if(r){
        const user=connectedUser[userId];
        io.to(user).emit("rate",{message:"success"});
    }
})

socket.on("disconnect", () => {
  delete connectedUser[socket.id];
  console.log("Disconnect:",socket.id)
});
socket.on("disconnect", () => {
  delete connectedDriver[socket.id];
  console.log("Disconnect driver:",socket.id)
});
});
}
