import conversationService from "../../services";

export async function addConversation ({commit, dispatch}, payload) {
    try {
        const token = this.state.member.token;
        let response = await conversationService.addConversation(payload, token)
        return response.data
    }
    catch (error) {
        console.log("error in adding conversation", error)
    }
}
