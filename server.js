const express=require("express");
const { Server } = require("socket.io");
const http = require("http");
const{cors,app}=require("./mainserver");
const {mongoose,url}=require("./Shema/shemas");
const routeEmail=require("./signin");
const logroute=require("./login");
const socketbook=require("./booking");
const prof=require("./profile")
app.use(cors());
app.use(express.json());
const server=http.createServer(app);
const io=new Server(server,{cors:{origin:"*"}});

async function run() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(" MongoDB connection error:", err);
    process.exit(1); // stop app if DB not connected
  }
}
run();
app.use(routeEmail);
app.use(logroute);
app.use(prof);
socketbook(io);
const PORT = process.env.PORT || 5000;
server.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
})