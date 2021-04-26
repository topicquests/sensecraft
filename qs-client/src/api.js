import feathers from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'
import auth from '@feathersjs/authentication-client'
import io from 'socket.io-client'

const socket = io('/', { path: '/api/socket.io' });

const api = feathers()
  .configure(socketio(socket))
  .configure(auth({ storage: window.localStorage }))

api.service('/users')


export default api
