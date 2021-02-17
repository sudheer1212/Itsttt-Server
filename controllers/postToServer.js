// This controller sends data to GA server 
const axios = require("axios"); 
const API_TO_CALL = 
(process.env.USE_PROD_API === '1') ? 
(process.env.GA_PROD_API) : 
(process.env.GA_DEV_API); 

console.log(`Using ${API_TO_CALL}`); 
const postData = async (body,route) => { 
    console.log("I am here"); 
    const api = `${API_TO_CALL}/${route}`
    try { 
        const response = await axios.post(api,body);
        console.log(response.data);  
        return response.data; 
    } catch (err) { 
        console.log("Problem while sending post request"); 
        console.log(err); 
        return 0; 
    }
}

const shareMessageToGroup = async(uuid, groupId, message) => { 
    try { 
        const body = {
            uuid, 
            groupId,
            message
        }
        const route = 'sendGameNotification';  
        const res = await postData(body,route); 
        return res; 
    } catch(err) { 
        console.log("Problem while sending post request"); 
        console.log(err); 
    }
}

module.exports = {
    shareMessageToGroup
} 