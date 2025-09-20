const jwt=require("jsonwebtoken");
const KEY='VanakkamdaMappla';
function authenticate(req,res,next){
    const authheader=req.headers['authorization'];
    if(!authheader)return res.status(401).json({message:"Token Missing"});
    const token=authheader.split(' ')[1];
    jwt.verify(token,KEY,(err,decoded)=>{
        if(err)return res.status(403).json({message:"invalid Token"});
        req.user=decoded;
        next();
    })
}
module.exports=authenticate;