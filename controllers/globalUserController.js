const usersHash = { }; 

const addUser = ({user_id, name, socket_id})=>{ 

    usersHash[user_id] = { 
        socket_id,
        name 
    }
    
    //console.log(usersHash); 
    //console.log(usersHash[user_id]);
    return usersHash[user_id]; 
}; 

const removeUser = (user_id) => { 
    delete usersHash[user_id];
    return 1; 
}

const getUser = (user_id) => { 
    return usersHash[user_id];
}

module.exports =  {
    addUser,
    removeUser,
    getUser
}