const { 
    addOnlinePlayer,
    getOnlinePlayers,
    resetStatus
} = require("../controllers/globalStatusController"); //require("../controllers/onlinePlaying"); 

const {
    shareMessageToGroup
} = require("../controllers/postToServer");

const {
    setSocketData,
    getSocketData,
    removeSocketData,
    setOpponentSockets,
    resetOpponentSockets 
} = require("../controllers/socketDataHash"); 

module.exports = (io) => { 
    io.of("/ttt").on("connection",(socket)=>{
        let handshakeQuery = socket.handshake.query;
        const { user_id,name,gameId } = handshakeQuery;
        console.log(`CONNECTED TTT ${name} ${user_id} with socket ${socket.id}`); 
        console.log(`with room ${gameId}`); 
        socket.join(gameId); 

        //After game starts     
        socket.on("game-status",(details)=>{
            const { user_id, group_id, status_message, sharePlayMessageToGroup, opponent_socket_id } = details; 
            if(status_message === "joined"){ 
                io.to(`${group_id}-senders`).emit('update',{user_id,status:3});
                addOnlinePlayer({user_id, group_id, socket_id:socket.id});
                setOpponentSockets(socket.id, [opponent_socket_id]); 
            } 
            if(status_message === "left"){ 
                io.to(`${group_id}-senders`).emit('update',{user_id,status:0});
                io.to(opponent_socket_id).emit("game-status",{opponent_status:"left"})
                resetStatus(user_id,group_id); 
                //removeOnlinePlayer({user_id, group_id, socket_id:socket.id}); 
                resetOpponentSockets(socket.id); 
            }  
            if(sharePlayMessageToGroup){
                shareMessageToGroup(user_id, group_id, sharePlayMessageToGroup); 
            }
            
        });

        //Between 2 people currently in the game
        socket.on("game-step",(data)=>{
            const {to,cell_no} = data; 
            io.to(to.socket_id).emit("game-step",{cell_no}); 
        }); 
        
        socket.on("disconnecting", (reason)=>{
            console.log(`DISCONNECTING TTT ROOMS:${socket.rooms} REASON :${reason}`);
        })

        socket.on("disconnect",(reason)=>{
            const data = getSocketData(socket.id);
            if(data) { 
                const {name,user_id} = data
                console.log(`DISCONNECT TTT ${name} REASON :${reason}`);
            } else { 
                console.log(`DISCONNECT TTT UNKNOWN REASON :${reason}`); 
            }
        })

    });
    
    
    io.of("/ttt").adapter.on("create-room", (room) => {
        console.log(`room ${room} was created`);
    });
    
    io.of("/ttt").adapter.on("join-room", (room, id) => {
        console.log(`socket ${id} has joined room ${room}`);
    });

    io.of("/ttt").adapter.on("leave-room", (room, id) => {
        console.log(`socket ${id} has left room ${room}`);
    });

    io.of("/ttt").adapter.on("delete-room", (room, id) => {
        console.log(`socket ${id} has deleted room ${room}`);
    });
}