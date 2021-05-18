
function SET_USER_DATA (state, userData) {  state.user = userData
    localStorage.setItem('user', JSON.stringify(userData))
    axios.defaults.headers.common['Authorization'] = `Bearer ${
      userData.token
    }`
};
   


