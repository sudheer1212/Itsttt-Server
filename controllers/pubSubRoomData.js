/*
Schema : 

{
    gameId : {
        createdAt : 
        psArray : [{
            eventName : eg: "game-step","game-message"
            data : {
                
            }
            messageId : i; // its the position of element in array 
            by : {

            } // Publishedby userid , Not required for 2 player games, still using   
        }]
    }
}

*/
const pubSubRooms = { 

};

const makeRoomIfNotExists = (room) => { 
    if(!pubSubRooms[room]) { 
        pubSubRooms[room] = {
            createdAt : new Date(),
            psArray : [] 
        }
    }
}

const checkRoomExists = (room) => {
    if(pubSubRooms[room]){
        return 1; 
    }
    return 0; 
}

const publishService = (room, userId, eventName, data) => { 
    let n = pubSubRooms[room].psArray.length; 
    pubSubRooms[room].psArray.push({
        eventName,
        data,
        messageId : n,
        by: userId 
    }); 
    return n+1
}

const subscribeService = (room, messageId)=>{ 
    let n = pubSubRooms[room].psArray.length; 
    if(messageId < n) { 
        return pubSubRooms[room].psArray.slice(messageId, n); 
    }
    return []; 
}

const deletePubSubRoom = (room) => {
    if(pubSubRooms[room]) {
        delete pubSubRooms[room]; 
    }
}

module.exports = {
    publishService,
    subscribeService,
    makeRoomIfNotExists,
    checkRoomExists
}