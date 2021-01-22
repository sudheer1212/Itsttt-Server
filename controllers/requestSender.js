/*
Sample
requestSender = { 
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

const requestSender = { }; 

const addRequestSender = ({user_id, group_id, socket_id})=>{ 
    console.log(group_id,user_id,socket_id,"joined as sender");
    if(!requestSender[group_id]) {
        requestSender[group_id] = {}; 
    }

    requestSender[group_id][user_id] =  {
        socket_id 
    }
    
 
    return requestSender[group_id][user_id]; 
}; 

const removeRequestSender = ({user_id, group_id}) => { 
    console.log(user_id ,"left as sender");
    delete requestSender[group_id][user_id];
    return 1; 
}

const getRequestSender = ({user_id,group_id}) => { 
    return requestSender[group_id][user_id];
}

module.exports =  {
    addRequestSender,
    removeRequestSender,
    getRequestSender
}