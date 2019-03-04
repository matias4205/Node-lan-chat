const express = require('express');
const app = express();
const server = require('http').createServer(app);
const socket = require('socket.io')(server);

require('./utils/connection')(socket)

app.use(express.static(__dirname + '/bower_components'));
app.get('/', function(req, res, next) {
    res.sendFile(__dirname + '/views/index.html');
});

server.listen(3000, () => {
    console.log('Server listening at http://localhost:' + server.address().port);
});