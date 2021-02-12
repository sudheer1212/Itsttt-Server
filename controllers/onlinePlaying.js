/*
Users online and playing 
Sample  
requestListener = { 
    group_1 : { 
        user_12 : 123_socket_id_12323,
        user_13 : 123_socket_id_233434,
    }
    group_2 : { 
        user_22 : 123_socket_id_34234,
        user_23 : 123_socket_id_45635,
    }
}

*/

const onlinePlaying = { }; 

const addOnlinePlayer = ({user_id, group_id, socket_id})=>{ 
    console.log(group_id,user_id,socket_id,"joined as online player");
    if(!onlinePlaying[group_id]) {
        onlinePlaying[group_id] = {}; 
    }

    onlinePlaying[group_id][user_id] =  {
        socket_id 
    }
    
    return onlinePlaying[group_id][user_id]; 
}; 

const removeOnlinePlayer = ({user_id, group_id}) => { 
    console.log(user_id,"left as online player");
    if(!onlinePlaying[group_id]) return 1; 

    delete onlinePlaying[group_id][user_id];
    return 1; 
} 

const getOnlinePlayer = ({user_id,group_id}) => { 
    return onlinePlaying[group_id][user_id];
}

const getOnlinePlayers = (group_id) => { 
    return onlinePlaying[group_id]; 
}

module.exports =  {
    addOnlinePlayer,
    removeOnlinePlayer,
    getOnlinePlayer,
    getOnlinePlayers
}