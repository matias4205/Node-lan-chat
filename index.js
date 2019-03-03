const express = require('express');
const app = express();
const server = require('http').createServer(app);
const socket = require('socket.io')(server);


app.use(express.static(__dirname + '/bower_components'));
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/views/index.html');
});

socket.on('connection', function(client) {
    console.log('Client connected...');
    
    client.on('join', function(data) {
    	console.log('Data from client: ' + data);
    });

});

setInterval(() => {
    console.log();
}, 5000)

server.listen(4200, () => {
    console.log('Server listening at http://localhost:' + server.address().port);
});