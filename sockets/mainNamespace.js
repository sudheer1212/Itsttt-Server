const { v4: uuidv4 } = require('uuid');

const { 
    addUser,removeUser,getUser
} = require("../controllers/globalUserController");

const { 
    resetStatus, 
    addRequestSender,
    removeRequestSender,
    getRequestSender,
    updateLatestGameId
} = require("../controllers/globalStatusController"); //require("../controllers/requestSender")
const {
    addRequestListener,
    getListeners, 
    getRequestListener 
} = require("../controllers/globalStatusController"); //require("../controllers/requestListener")
const { 
    addOnlinePlayer,
    getOnlinePlayers
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
    
    io.on("connection",(socket)=>{

        let handshakeQuery = socket.handshake.query;
        const { user_id, name, group_id } = handshakeQuery;
        console.log(`CONNECTED MAIN ${name} ${user_id} with socket ${socket.id}`); 
        setSocketData(socket.id, user_id, group_id); 

        //NOT USING GLOBAL ROOM FOR NOW 
        socket.on("global-room",({user_id,name,group_id},callBack)=>{
            setSocketData(socket.id, user_id, group_id)
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
            const onlinePlaying = getOnlinePlayers(group_id); 
            callBack(listenersOnline,onlinePlaying); 
        })
        socket.on('leave-request-sender',(details,callBack)=>{
            const { user_id, group_id } = details; 
            resetStatus(user_id,group_id); 
            //removeRequestSender({user_id,group_id}); 
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
            resetStatus(user_id,group_id); 
            //removeRequestListener({user_id,group_id}); 
            socket.leave(`${group_id}-listeners`); 
            io.to(`${group_id}-senders`).emit('update',{user_id,status:0});
            callBack(); 
        })


        // =======================
        socket.on("invite",(inviteObject,callBack)=>{
            const { from, to, room_id, group_id } = inviteObject; 
            
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
            const update_receiver = getRequestSender({user_id:to.user_id,group_id});
            if(update_receiver) { 
                if(status === 1 && 1) { //add update receiver status here 

                    const gameId = uuidv4(); 
                    updateLatestGameId(group_id,from.user_id,gameId); 
                    updateLatestGameId(group_id,to.user_id,gameId); 
                    
                    console.log(`Game id made ${gameId}`); 

                    io.to(update_receiver.socket_id).emit("start",{ // To Request Sender
                        opponent : {
                            opponent_user_id : from.user_id,
                            opponent_name: from.name,
                            turn:1 //Request sender gets the first  turn
                        },
                        gameId : gameId
                    }); 
                    io.to(socket.id).emit("start",{  //To Request Listener
                        opponent : {
                            opponent_user_id : to.user_id,
                            opponent_name: to.name,
                            turn:0
                        },
                        gameId : gameId
                    }); 

                    pubSubRoomData.makeRoomIfNotExists(gameId); 
                    shareMessageToGroup(user_id, group_id, `${to.name} started playing Tic Tac Toe with ${to.name}`);
                } else {
                    io.to(update_receiver.socket_id).emit("update",{user_id:from.user_id,status});
                }
                
            }
        }); 

        socket.on("disconnect",(reason)=>{
            const data = getSocketData(socket.id);
            if(data) { 
                const {name,user_id} = data
                console.log(`DISCONNECT ${name} REASON :${reason}`);
            } else { 
                console.log(`DISCONNECT UNKNOWN REASON :${reason}`); 
            }
            
        })


        // UNDER TEST 
        // socket.on("disconnect",()=>{ 
        //     const data = getSocketData(socket.id);
        //     if(data) { 
        //         const { user_id, group_id } = data
                
        //         // TEST THIS FIRST 
        //         // //tell opponents you lost internet
        //         // if(data.opponentSockets) { 
        //         //     data.opponentSockets.forEach( (id) => {
        //         //         io.to(id).emit("game-status",{opponent_status:"lostInternet"}); 
        //         //     });
        //         // }
                
        //         //tell request senders you are offline 
        //         io.to(`${group_id}-senders`).emit('update',{user_id,status:0});
                
        //         //reset status so that if new sender gets proper info 
        //         resetStatus(user_id,group_id); 

        //         console.log("SOMEONE DISCONNECTED SOCKET CONNECTION"); 
        //         //remove socket data from hash 
        //         removeSocketData(socket.id); 
        //     } 
            
        // })
    })
}