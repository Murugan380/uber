const express=require("express");
const {cors,app,nodemail}=require("./mainserver");
const multer=require("multer");
const fs=require('fs');
const path=require("path");
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./images')
    },
    filename:function(req,file,cb){
        cb(null,file.fieldname+'-'+Date.now()+'-'+Math.floor(Math.random()*90000*10000)+'-'+file.originalname+path.extname(file.originalname))
    }
});
const filefilter=(req,file,cb)=>{
    const allowtype=/jpg|jpeg|png/;
    const ext=allowtype.test(path.extname(file.originalname));
    const mimetype=allowtype.test(file.mimetype);
    if(ext && mimetype){
        cb(null,true)
    }
    else{
        cb(new Error("Invalid File formate"))
    }
}
const filesize=5*1020*1020;
const fileupload=multer({
    storage:storage,
    limits:filesize,
    fileFilter:filefilter
})

module.exports=fileupload;