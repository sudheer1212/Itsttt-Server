// Sample
// players and statuses = { 
//     group_1 : { 
//         user_12 : 123_socket_id_12323,
//         user_13 : 123_socket_id_233434,
//     }
//     group_2 : { 
//         user_22 : 123_socket_id_34234,
//         user_23 : 123_socket_id_45635,
//     }
// }
/* 
userStates are 
0->Offline/Rejected  
1->Available(listener)  
2->Requesting //this is only on client 
3->Playing(with another friend) 
4->Sending Invites   
*/

// Object.filter = (obj, status) => 
//     Object.keys(obj)
//           .filter( key => obj[] )
//           .reduce( (res, key) => (res[key] = obj[key], res), {} );

const log = (a,b) => { 
    console.log(`${a} status ${b}`)
}

let globalStatusObject = { 

}
const updatePlayerStatus = (user_id,group_id,socket_id,status) => { 
    if(!globalStatusObject[group_id]) {
        globalStatusObject[group_id] = {}; 
    }
    globalStatusObject[group_id][user_id] =  {
        socket_id,
        status
    }
    return 1; 
}; 

const resetStatus = (user_id,group_id) => {
    if(!globalStatusObject[group_id] || !globalStatusObject[group_id][user_id]) {
        return ; 
    }
    globalStatusObject[group_id][user_id].status = 0; 
}


const getPlayersObjWithParticularStatus = (group_id,status) => { 
    if(!globalStatusObject[group_id]) {
        return {}
    }
    const result = Object.keys(globalStatusObject[group_id])
    .filter((key) => {
        return globalStatusObject[group_id][key].status === status
    }).reduce((obj, key) => {
        obj[key] = globalStatusObject[group_id][key];
        return obj;
    }, {})
    return result; 
}


const getPlayersWithParticularStatus = (group_id,status) => { 
    if(!globalStatusObject[group_id]) {
        return {}
    }
    const result = Object.keys(globalStatusObject[group_id])
    .filter((key) => {
        return globalStatusObject[group_id][key].status === status
    })
    return result; 
}

const addRequestSender = ({user_id,group_id,socket_id}) => { 
    log(user_id,"joined sender"); 
    updatePlayerStatus(user_id,group_id,socket_id,4); 
}

const removeRequestSender = ({user_id,group_id}) => {
    log(user_id,"left sender");  
    resetStatus(user_id,group_id); 
}

const addRequestListener = ({user_id,group_id,socket_id}) => { 
    log(user_id,"joined listener");  
    updatePlayerStatus(user_id,group_id,socket_id,1); 
}

const removeRequestListener = ({user_id,group_id}) => { 
    log(user_id,"left listener"); 
    resetStatus(user_id,group_id); 
}

const addOnlinePlayer = ({user_id,group_id,socket_id}) => { 
    log(user_id,"joined player"); 
    updatePlayerStatus(user_id,group_id,socket_id,3); 
}

const removeOnlinePlayer = ({user_id,group_id,socket_id}) => { 
    log(user_id,"left player"); 
    resetStatus(user_id,group_id); 
}

const getRequestSender = ({user_id,group_id}) => { 
    let x = globalStatusObject[group_id][user_id]; 
    if(x && x.status === 4) { 
        return x; 
    } 
    return null; 
}

const getRequestListener = ({user_id,group_id}) => { 
    let x = globalStatusObject[group_id][user_id]; 
    if(x && x.status === 1) { 
        return x; 
    } 
    return null; 
}

const getListeners = (group_id) => {  
    const result = getPlayersObjWithParticularStatus(group_id,1); 
    return result 
}

const getOnlinePlayers = (group_id) => {  
    const result = getPlayersObjWithParticularStatus(group_id,3);
    return result
}

module.exports = { 
    addRequestSender,
    removeRequestSender,
    getRequestSender,
    addRequestListener,
    removeRequestListener,
    getListeners, 
    getRequestListener,
    addOnlinePlayer,
    removeOnlinePlayer,
    getOnlinePlayers,
    resetStatus
}