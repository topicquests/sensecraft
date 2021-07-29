

export  function getUser(state) {
    return state.user;
};

export function getUserId(state) {
    return state.user.id;
}

export const getUserById = (state) => (id) => {

    return state.user.id;
}


/*
export function someGetter (state) {
}
*/
