

export  function getUser(state) {
    return state.member;
};

export function getUserId(state) {
    return state.member.id;
}

export const getUserById = (state) => (id) => {

    return state.member.id;
}


/*
export function someGetter (state) {
}
*/
