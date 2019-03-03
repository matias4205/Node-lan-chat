const socket = require('socket.io-client').connect('http://localhost:4200');
const rl = require('readline');

const readLine = rl.createInterface({
    input: process.stdin,
    output: process.stdout
});

socket.on('room-info', (info) => {
    console.log(`${info.online} Online - ${info.waiting} Waiting for a chat - ${info.chatting} Chatting\n`);
    
    readLine.question('Enter an user name: ', (user) => {
        socket.emit('register', user);
    });

    readLine.question('Initialize chat with: ', (username) => {
        socket.emit('chat-request', username)
    })

    socket.on('new-chat', (room_data) => {
        console.clear();
        console.log(`Room ID: ${room_data.roomID}\n`);
        readLine.question('Your message: ', (message) => {
            socket.emit('message', { destination: room_data.participants[room_data.me], text: message})
        })
    });

    socket.on('message', (msg_data) => {
        console.log(msg_data.from + ': ' + msg_data.text);
    });

    
});