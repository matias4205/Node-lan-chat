const socket = require('socket.io-client').connect('http://192.168.0.17:3000');
const rl = require('readline');
const chalk = require('chalk');


const readLine = rl.createInterface({
    input: process.stdin,
    output: process.stdout
});

function showRoomInfo(data){
    var usersWaitingList = '';

    console.clear();
    console.log(chalk.green(data.online) + ' Online - ' + chalk.blue(data.waiting.length) + ' Waiting - ' + chalk.red(data.chatting) + ' Chatting\n');
    console.log('Waiting for a chat:');
    data.waiting.map((user) => {
        usersWaitingList += user + ' ';
    });
    console.log(chalk.blue(usersWaitingList));
}

socket.on('room-info', (data) => {
    showRoomInfo(data);

    readLine.question('\nEnter an user name: @', (user) => {
        socket.emit('register', '@' + user);
        readLine.setPrompt('Initialize chat with: ');
        readLine.prompt();
        readLine.on('line', (username) => {
            if(username.charAt(0) === '@') socket.emit('chat-request', username);
        })
    });
})


socket.on('new-chat', (room_data) => {
    console.clear();
    console.log(`Room ID: ${room_data.roomID}\n`);

    readLine.setPrompt('\x1b[34myou>\x1b[0mx');
    readLine.prompt()
    readLine.removeAllListeners('line');
    readLine.on('line', (line) => {
        if (line === "!leave") readLine.close();
        console.log(chalk.green(room_data.participants[room_data.me]) + ': ' + line);
        socket.emit('message', { roomID: room_data.roomID, he: room_data.he , destination: room_data.participants[room_data.he], text: line});
    }).on('close',function(){
        process.exit(0);
    });
});

socket.on('message', (msg_data) => {
    console.log(chalk.red(msg_data.from) + ': ' + msg_data.text);
});