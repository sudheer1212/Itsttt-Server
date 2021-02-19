/*
Format : 
{
    '1234343435' : {
        user_id : sadas,
        group_id : adsdad,
        opponent_sockets : ['12323,213213232,3434334]
    }
}
*/
const socketDataHash = { } 

const setSocketData = (socket_id,user_id,group_id) => { 
    socketDataHash[socket_id] = {
        user_id,
        group_id
    }
}

const getSocketData = (socket_id) => {
    return socketDataHash[socket_id]; 
}

const removeSocketData = (socket_id) => { 
    delete socketDataHash[socket_id]; 
}

const setOpponentSockets = (socket_id,arr) => { //array 
    socketDataHash[socket_id].opponentSockets = arr; 
}

const resetOpponentSockets = (socket_id) => {
    if(socketDataHash[socket_id]) {
        socketDataHash[socket_id].opponentSockets = null; 
    }
}

module.exports = {
    setSocketData,
    getSocketData,
    removeSocketData,
    setOpponentSockets,
    resetOpponentSockets
}