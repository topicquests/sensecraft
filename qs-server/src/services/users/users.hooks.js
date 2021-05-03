const { authenticate } = require('@feathersjs/authentication').hooks;

const {
  hashPassword, protect
} = require('@feathersjs/authentication-local').hooks;

<<<<<<< HEAD
function debug() {
  console.log('Enter users hook');
}

=======
>>>>>>> 1813c3b045656074250a45846b9f18940a8883d0
module.exports = {
  before: {
    all: [],
    find: [ authenticate('jwt') ],
    get: [ authenticate('jwt') ],
<<<<<<< HEAD
    create: [ hashPassword('password'), debug ],
=======
    create: [ hashPassword('password') ],
>>>>>>> 1813c3b045656074250a45846b9f18940a8883d0
    update: [ hashPassword('password'),  authenticate('jwt') ],
    patch: [ hashPassword('password'),  authenticate('jwt') ],
    remove: [ authenticate('jwt') ]
  },

  after: {
    all: [ 
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect('password')
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
