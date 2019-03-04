const socket = require('socket.io-client').connect('http://localhost:3000');
const rl = require('readline');

const readLine = rl.createInterface({
    input: process.stdin,
    output: process.stdout
});

function sendMessage(room_data){
    
    readLine.question('> ', (message) => {
        socket.emit('message', { destination: room_data.participants[room_data.he], text: message});
        sendMessage(room_data);
    });
    
}

readLine.question('Enter an user name: ', (user) => {
    socket.emit('register', user);
    readLine.question('Initialize chat with: ', (username) => {
        socket.emit('chat-request', username)
    })
});

socket.on('new-chat', (room_data) => {
    console.clear();
    console.log(`Room ID: ${room_data.roomID}\n`);
    sendMessage(room_data);
});

socket.on('message', (msg_data) => {
    console.log(msg_data.from + ': ' + msg_data.text);
});