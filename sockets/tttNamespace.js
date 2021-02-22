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

const pubSubRoomData = require("../controllers/pubSubRoomData"); 

module.exports = (io) => { 

    const tttNamespace = io.of("/ttt"); 
    io.of("/ttt").on("connection",(socket)=>{
        let handshakeQuery = socket.handshake.query;
        const { user_id, group_id, name, gameId } = handshakeQuery;
        console.log(`Handshake query ${JSON.stringify(handshakeQuery)}`); 
        console.log(`Joined game id ${gameId}`); 
        socket.join(gameId); 
        pubSubRoomData.makeRoomIfNotExists(gameId); 
        
        addOnlinePlayer({user_id, group_id, socket_id:socket.id});
        io.to(`${group_id}-senders`).emit('update',{user_id,status:3});
        tttNamespace.to(group_id).emit("game-status", {opponent_status : "connected"}); 

        socket.on("reconnected-user",(lastKnownMessageId)=>{
            let arrayToSubscribe = pubSubRoomData.subscribeService(gameId, lastKnownMessageId); 
            arrayToSubscribe.forEach((x) => {
                socket.to(socket.id).emit(x.eventName,{
                    data  : x.data, 
                    messageId : x.messageId, 
                    by : x.by 
                })
            })
        }); 
        
        //After game starts     
        socket.on("game-status",(details)=>{
            const { sharePlayMessageToGroup } = details; 
            if(sharePlayMessageToGroup){
                shareMessageToGroup(user_id, group_id, sharePlayMessageToGroup); 
            }
        });

        //Between 2 people currently in the game
        socket.on("game-step",(data,callback)=>{
            let n = pubSubRoomData.publishService(gameId,"game-step",data); 
            socket.broadcast.to(gameId).emit("game-step",{
                data,
                messageId : n,
                by: user_id
            }); 
            callback(n); 
            
        }); 
        
        // socket.on("disconnecting", (reason)=>{
        //     console.log(`DISCONNECTING TTT ROOMS:${socket.rooms} REASON :${reason}`);
        //     let rooms = socket.rooms;
        //     rooms.forEach(room => {
        //         console.log(`ROOM ${room}`); 
        //     });
        // })

        socket.on("disconnect",(reason)=>{
            resetStatus(user_id,group_id); 
            io.to(`${group_id}-senders`).emit('update',{user_id,status:0});
            
            const data = getSocketData(socket.id);
            if(data) { 
                const {name,user_id} = data
                console.log(`DISCONNECT TTT ${name} REASON :${reason}`);
            } else { 
                console.log(`DISCONNECT TTT UNKNOWN REASON :${reason}`); 
            }

            if(reason === "client namespace disconnect"){
                // Left the game for real
                console.log(`Informing opponent in game ${gameId}`)
                tttNamespace.to(gameId).emit("game-status",{opponent_status:"left"});
            } else { 
                tttNamespace.to(gameId).emit("game-status",{opponent_status:"lostConnection"});
            }
        })

    });
    
    
    // io.of("/ttt").adapter.on("create-room", (room) => {
    //     console.log(`room ${room} was created`);
    // });
    
    // io.of("/ttt").adapter.on("join-room", (room, id) => {
    //     console.log(`socket ${id} has joined room ${room}`);
    // });

    // io.of("/ttt").adapter.on("leave-room", (room, id) => {
    //     console.log(`socket ${id} has left room ${room}`);
    // });

    // io.of("/ttt").adapter.on("delete-room", (room) => {
    //     console.log(`Deleted room ${room}`);
    // });
}