const gameRooms = {}; 

const addUserInGame = ({user_id,room_id})=>{ 
    gameRooms[room_id].push(user_id); 

    return gameRooms[room_id]; 
}

module.exports = { 
    addUserInGame 
}
