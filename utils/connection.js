const room_matching = require('./room-matching')();

module.exports = (socket) => {
    socket.on('connection', (user_socket) => {
        room_matching.sendRoomInfo(user_socket);
        user_socket.on('register', (user) => {
			console.info(`User registered: {name: ${user}, id: ${user_socket.id}}`)
            room_matching.userConnect({ socket, user });
        });
        user_socket.on('chat-request', (username) => {
            room_matching.initChat(user_socket.id, username);
        });
        user_socket.on('message', (msg_data) => {
            room_matching.sendMsg( user_socket.id, msg_data )
        })
    });
}