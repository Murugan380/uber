const mongoose=require("mongoose");
const url="mongodb://127.0.0.1:27017/murugan";

//user//
const usershema=new mongoose.Schema({
    name:String,
    email:{type:String,unique:true},
    phone:{type:Number,unique:true},
    password:String,
    photo:String,
    role:{type:String,default:"user"},
    createdAt:{type:Date,default:Date.now}
});
const user=mongoose.model("user",usershema);

//driver//
const drivershema=new mongoose.Schema({
    name:String,
    email:{type:String,unique:true},
    phone:{type:Number,unique:true},
    password:String,
    role:{type:String,default:"driver"},
    vehicaltype:{type:String,enum:["bike","auto","car"]},
    numberplate:String,
    address:String,
    worklocation:String,
    socketId:String,
    createdAt:{type:Date,default:Date.now}
});
const driver=mongoose.model("driver",drivershema);

//admin//
const adminshema=new mongoose.Schema({
    name:String,
    email:{type:String,unique:true},
    phone:{type:Number,unique:true},
    password:String,
    role:{type:String,default:"admin"},
    createdAt:{type:Date,default:Date.now}
});
const admin=mongoose.model("admin",adminshema);

//ride//
const rideshema=new mongoose.Schema({
    rider:{type:mongoose.Schema.ObjectId,ref:"user"},
    driver:{type:mongoose.Schema.ObjectId,ref:"driver"},
    friendname:String,
    friendphone:Number,
    pickup:String,
    drop:String,
    fare:Number,
    status:{type:String,enum:['pending','accepted','process','completed','cancelled'],default:'pending'},
    createdAt:{type:Date,default:Date.now}
})
const ride=mongoose.model("ride",rideshema);


//payment//
const payshema=new mongoose.Schema({
    ride:{type:mongoose.Schema.ObjectId,ref:"ride"},
    rider:{type:mongoose.Schema.ObjectId,ref:"user"},
    driver:{type:mongoose.Schema.ObjectId,ref:"driver"},
    amount:Number,
    method:{type:String,default:"cash"},
    createdAt:{type:Date,default:Date.now}
})
const payment=mongoose.model("payment",payshema);

//Rating//
const ratingshema=new mongoose.Schema({
     ride:      { type: mongoose.Schema.Types.ObjectId, ref: "ride" },
  rider:     { type: mongoose.Schema.Types.ObjectId, ref: "user"},
  driver:    { type: mongoose.Schema.Types.ObjectId, ref: "driver" },
  rating:    { type: Number, min: 1, max: 5 },
  comment:   { type: String },
  createdAt: { type: Date, default: Date.now }
});
const rating=mongoose.model("rating",ratingshema);

module.exports={user,driver,admin,ride,payment,rating,mongoose,url}