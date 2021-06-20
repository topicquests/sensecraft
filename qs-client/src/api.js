import io from 'socket.io-client'
import api  from 'boot/feathersClient';

const socket = io("localhost:3030")

api.service('/users')


export default api
