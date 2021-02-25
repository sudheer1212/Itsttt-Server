const schedule = require('node-schedule');
const deleteRoomAfterSeconds = 3600; 
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

const roomCleaner = () => { 
    const rooms = Object.keys(pubSubRooms);
    const timeNow = new Date();
    rooms.forEach((room) => {
        const secondsPassed = (timeNow - pubSubRooms[room].createdAt)/1000; 
        if(secondsPassed > deleteRoomAfterSeconds) {  
            console.log(`Deleting room ${room} after ${secondsPassed} seconds`); 
            delete pubSubRooms[room]; 
        }
    })
}


schedule.scheduleJob('1 * * * *',()=>{ //every hour at minute 1
    console.log("Running pubsub room cleaner job"); 
    roomCleaner(); 
})

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
    makeRoomIfNotExists(room);
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

const pbArrayLength = (room)=>{ //for testing  
    return pubSubRooms[room].psArray.length; 
}

module.exports = {
    publishService,
    subscribeService,
    makeRoomIfNotExists,
    checkRoomExists,
    pbArrayLength
}