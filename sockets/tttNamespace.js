const { 
    addOnlinePlayer,
    getOnlinePlayers,
    resetStatus,
    getLatestGameId,
    updateLatestGameId 
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
const colors = require('colors');

//const { colors } =  require("../methods/debugColours"); 

module.exports = (io) => { 
     
    const tttNamespace = io.of("/ttt"); 

    // io.of("/ttt").use((socket, next) => {
    //     console.log(`Handshake query ${JSON.stringify(handshakeQuery)}`); 
    //     const handshakeQuery = socket.handshake.query;
    //     const gameId = handshakeQuery.gameId;
    //     next(); 
    //     if(gameId && pubSubRoomData.checkRoomExists(gameId)){
    //         next()
    //     } else {
    //         console.log(`INVALID GAME ID ${gameId}`); 
    //     }
    // });

    io.of("/ttt").on("connection",(socket)=>{
        let handshakeQuery = socket.handshake.query;
        const { user_id, group_id, name } = handshakeQuery;
        console.log(`Handshake query ${JSON.stringify(handshakeQuery)}`); 

        const gameId = getLatestGameId(group_id,user_id); 
        console.log(colors.bold.red(`Joined game id ${gameId}`)); 
        pubSubRoomData.makeRoomIfNotExists(gameId); 
        socket.join(gameId); 

        //Spread the news
        addOnlinePlayer({user_id, group_id, socket_id:socket.id});
        io.to(`${group_id}-senders`).emit('update',{user_id,status:3});
        socket.broadcast.to(gameId).emit("game-status", {opponent_status : "connected", by: user_id}); 

        socket.on("reconnect-ask-data",(askFromMsgId)=>{  

            console.log(
            `${user_id} is asking for ${askFromMsgId} and array len is ${pubSubRoomData.pbArrayLength(gameId)}`)
            let arrayToSubscribe = pubSubRoomData.subscribeService(gameId, askFromMsgId); 
            arrayToSubscribe.forEach((x) => {
                tttNamespace.to(socket.id).emit(x.eventName,{
                    data  : x.data, 
                    messageId : x.messageId, 
                    by : x.by 
                })
                console.log(`Emitting event '${x.eventName}' with data ${x.data} with messageId ${x.messageId}`);
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
            console.log(`GAME STEP RECEIVED FROM ${user_id} DATA ${data.cell_no}`)
            let n = pubSubRoomData.publishService(gameId,user_id,"game-step",data); 
            socket.broadcast.to(gameId).emit("game-step",{
                data,
                messageId : n,
                by: user_id
            }); 
            callback(n); 
            
        }); 
        
        socket.on("disconnecting", (reason)=>{
            console.log(`SOMEONE IS DISCONNECTING`);
        })

        socket.on("disconnect",(reason)=>{
            resetStatus(user_id,group_id); 
            io.to(`${group_id}-senders`).emit('update',{user_id,status:0});
            console.log(`DISCONNECT ${user_id} TTT UNKNOWN REASON :${reason}`); 
            if(reason === "client namespace disconnect"){
                // Left the game for real
                console.log(`Informing opponent in game ${gameId}`)
                tttNamespace.to(gameId).emit("game-status",{opponent_status:"left", by : user_id});
            } else { 
                tttNamespace.to(gameId).emit("game-status",{opponent_status:"disconnected", by: user_id});
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