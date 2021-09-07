import axiosInstance from "../boot/axios";

export async function addConversationNode(payload, token) {
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
        console.log ("Error in adding conversation node", err.response)
      }
    })
  }
  export async function getConversationByQuestId(payload, token) {
    const options = token ? {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    } : {};
   return axiosInstance.get("/conversation_node?quest_id=eq." + payload,
   options
    ).then (response => {
      return response;
    }).catch(err => {
      if (err.response) {
        let errorCode = err.response.data.code;
        console.log ("Error in adding conversation", err.response)
      }
    })
  }
  export async function getParentNode(payload, token) {
    const options = token ? {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    } : {};
   return axiosInstance.get("/conversation_node?id=eq." + payload,
   options
    ).then (response => {
      return response;
    }).catch(err => {
        let errorCode = err.response.data.code;
        console.log ("Error in adding conversation", err.response)
    })
  }