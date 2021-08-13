import axiosInstance from "../boot/axios";

export async function addConversation(payload, token) {
    const options = token ? {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    } : {};
   return axiosInstance.post("/conversation_node",
    payload
    , options
    ).then (response => {
      return response;
    }).catch(err => {
      if (err.response) {
        let errorCode = err.response.data.code;
        console.log ("Error in adding conversation", err.response)
      }
    })
  }