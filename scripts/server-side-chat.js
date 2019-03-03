const socket = require('socket.io-client').connect('http://localhost:4200');
socket.emit('join', 'puto');