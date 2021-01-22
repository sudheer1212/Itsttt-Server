/*
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

const requestListener = { }; 

const addRequestListener = ({user_id, group_id, socket_id})=>{ 
    console.log(group_id,user_id,socket_id,"joined as listener");
    if(!requestListener[group_id]) {
        requestListener[group_id] = {}; 
    }

    requestListener[group_id][user_id] =  {
        socket_id 
    }
    
    return requestListener[group_id][user_id]; 
}; 

const removeRequestListener = ({user_id, group_id}) => { 
    console.log(user_id,"left as listener");
    if(!requestListener[group_id]) return 1; 

    delete requestListener[group_id][user_id];
    return 1; 
} 

const getRequestListener = ({user_id,group_id}) => { 
    return requestListener[group_id][user_id];
}

const getListeners = (group_id) => { 
    return requestListener[group_id]; 
}

module.exports =  {
    addRequestListener,
    removeRequestListener,
    getRequestListener,
    getListeners
}