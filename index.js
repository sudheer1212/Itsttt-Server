require("dotenv").config(); 
const express = require("express"); 
const socketio = require("socket.io"); 
const http = require("http");
const cors = require('cors');


const app = express(); 
app.use(cors());

const server = http.createServer(app);
const io = socketio(server,{
    cors: {
    origin: "*", // put frontend url in production 
    credentials: true
    },
    pingInterval: 2000, //5000
    pingTimeout: 3000   //5000
}); 

app.use(express.json());
app.use(express.urlencoded({extended: true})); 

app.get("/",(req,res)=>{
    res.send("Server for online tic tac toe is up and running"); 
}); 

require("./sockets/mainNamespace.js")(io);
require("./sockets/tttNamespace.js")(io);


const PORT = process.env.PORT || 5000; 
server.listen(PORT, ()=>{
    console.log(`Server started on port ${PORT}`); 
})

