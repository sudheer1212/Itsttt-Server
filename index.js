const express = require("express"); 
const socketio = require("socket.io"); 
const http = require("http");
const cors = require('cors');


const app = express(); 
// app.use(cors());
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "https://localhost:3000");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

const server = http.createServer(app);
const io = socketio(server,{
    cors: {
    origin: "http://localhost:3000",
    credentials: true
    }}
); 


const { 
    addUser,removeUser
} = require("./controllers/globalUserController");
const { 
    addUserInGame 
} = require("./controllers/userGameRoomsController");

io.on("connection",(socket)=>{
    socket.on("global-room",({user_id,name},callBack)=>{
        const user = addUser({user_id, name, socket_id:socket.id}); 
        callBack(user); 
    }); 

    socket.on("disconnect-global-room",( {user_id},callBack )=>{    
        removeUser(user_id);
        callBack(); 
    })

    socket.on("join-game-room",({user_id,name,admin,group})=>{
        const group_id = group + "-" + admin; 
        socket.join(group_id); 
    })

})

const PORT = process.env.PORT || 5000; 
server.listen(PORT, ()=>{
    console.log(`Server started on port ${PORT}`); 
});