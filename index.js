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
    addUser,removeUser,getUser
} = require("./controllers/globalUserController");

const { 
    addRequestSender,
    removeRequestSender,
    getRequestSender
} = require("./controllers/requestSender")
const {
    addRequestListener,
    removeRequestListener,
    getListeners, 
    getRequestListener 
} = require("./controllers/requestListener")

const { isNullOrUndefined } = require("util");
const { response } = require("express");

io.on("connection",(socket)=>{

    //NOT USING GLOBAL ROOM FOR NOW 
    socket.on("global-room",({user_id,name},callBack)=>{
        const user = addUser({user_id, name, socket_id:socket.id}); 
        callBack(user); 
    }); 

    socket.on("disconnect-global-room",( {user_id},callBack )=>{    
        removeUser(user_id);
        callBack(); 
    })

    // For request senders 
    socket.on('request-sender',(details,callBack)=>{
        const { user_id, group_id } = details; 
        addRequestSender({user_id,group_id,socket_id:socket.id}); 
        socket.join(`${group_id}-senders`); 
        //socket.join(`${group_id}-${user_id}`); // request senders join 
        const listenersOnline = getListeners(group_id); 
        callBack(listenersOnline); 
    })
    socket.on('leave-request-sender',(details,callBack)=>{
        const { user_id, group_id } = details; 
        removeRequestSender({user_id,group_id}); 
        socket.leave(`${group_id}-senders`); 
        callBack(); 
    })

    // For request listeners
    socket.on('request-listener',(details,callBack)=>{
        const { user_id, group_id } = details; 
        addRequestListener({user_id,group_id,socket_id:socket.id}); 
        socket.join(`${group_id}-listeners`); 
        io.to(`${group_id}-senders`).emit('update',{user_id,status:1}) //inform request senders that you are available 
        callBack(); 
    })

    socket.on('leave-request-listener',(details,callBack)=>{
        const { user_id, group_id } = details; 
        removeRequestListener({user_id,group_id}); 
        socket.leave(`${group_id}-listeners`); 
        io.to(`${group_id}-senders`).emit('update',{user_id,status:0});
        callBack(); 
    })


    // =======================
    socket.on("invite",(inviteObject,callBack)=>{
        const { from, to, room_id, group_id } = inviteObject; 
        
        /* Needed ???? */
        // if( from.user_id === to.user_id) { 
        //     socket.join(room_id); 
        //     callBack();
        //     return;  
        // }  

        const invite_receiver = getRequestListener({user_id:to.user_id, group_id}); 
        if(invite_receiver) { 
            //relay invite to friend 
            io.to(invite_receiver.socket_id).emit("invite",{from,room_id}); 
        } else { 
            //send invite back if friend is offline
            io.to(socket.id).emit("update",{user_id:to.user_id, status:0}); 
        }
    
    })

    // Listeners send update event 
    socket.on("update",(responseObject,callBack) => { 
        
        const { group_id, from, to, status} = responseObject; 
        const response_receiver = getRequestSender({user_id:to.user_id,group_id});
        if(response_receiver) { 
            if(status === 1) { 
                io.to(response_receiver.socket_id).emit("start",{ // To Sender
                    opponent : {
                        user_id : from.user_id,
                        name: from.name,
                        socket_id : socket.id 
                    }
                }); 
                io.to(socket.id).emit("start",{  //To Listener
                    opponent : {
                        user_id : to.user_id,
                        name: to.name,
                        socket_id : response_receiver.socket_id 
                    }
                }); 
            }
            if(status === 0){
                io.to(response_receiver.socket_id).emit("update",{user_id:from.user_id,status});
            }
        }
    }); 
})

const PORT = process.env.PORT || 5000; 
server.listen(PORT, ()=>{
    console.log(`Server started on port ${PORT}`); 
})

