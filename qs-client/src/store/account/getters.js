import userService from "../../services/user";
import { Notify } from "quasar";


export async function getUser({commit, rootState}, payload) {
 return $store.state.auth.user;
    
};

