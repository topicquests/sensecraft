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
        console.log ("Error in getting parent node", err.response)
    })
  }
  export async function getNode(payload, token) {
    const options = token ? {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    } : {};
   return axiosInstance.get("/conversation_node?guild_id=eq." + payload.guild_id +
   "&quest_id=eq." + payload.quest_id +
   "&creator_id=eq." + payload.creator_id,
   options
    ).then (response => {
      return response;
    }).catch(err => {
        let errorCode = err.response.data.code;
        console.log ("Error in getting node", err.response)
    })
  }
  export async function updateNode(node, token) {
    const options = token ? {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    } : {};
   return axiosInstance.patch(`/conversation_node?id=eq.${node.id}`, node, options
   ).then (function(response) {
      console.log("Node was updated successfully");
      return response;
   }).catch(err => {
    if (err.response) {
      let errorCode = err.response.data.code;
        console.log ("Error in updating node ", err.response)
      }
    })
  }