module.exports = () => {
    const online = {}, onWait = [], onChat={};

    setInterval(printStatus, 2000);

    function printStatus(){
        console.log(`${Object.keys(online).length} Online - ${onWait.length} Waiting for a chat - ${Object.keys(onChat).length} Chatting`);
    }

    function createChat(user1ID, user2ID){
        
        const roomID = user1ID + user2ID;
        
        online[user1ID].roomID = roomID;
        online[user2ID].roomID = roomID;

        console.log(`Chat room created for ${online[user1ID].user} and ${online[user2ID].user}`);
        
        if(!onChat[roomID]) onChat[roomID] = {
            roomID,
            participants: [ online[user1ID].user, online[user2ID].user],
            messages: 0
        }            
        
        
        online[user1ID].socket.emit('new-chat', {
            roomID,
            participants: [online[user1ID].user, online[user2ID].user],
            messages: 0,
            me: 0,
            he: 1
        });
       

        online[user2ID].socket.emit('new-chat', {
            roomID,
            participants: [online[user1ID].user, online[user2ID].user],
            messages: 0,
            me: 1,
            he: 0
        });
    }

    function searchForUserId(user_name){
        const [ { socket_id } ] = onWait.filter( user => user.user == user_name);
        return socket_id;
    }

    return {
        userConnect: ( socket, user ) => {
            if(!online[socket.id]){
                online[socket.id] = { user, socket };
                onWait.push({ socket_id: socket.id, user});
            }
            console.log(online);
        },
        
        initChat: (user1ID, user2_userName) => {
            createChat(user1ID, searchForUserId(user2_userName));
        },

        sendRoomInfo: (socket) => {
            socket.emit('room-info', {
                online: Object.keys(online).length,
                waiting: onWait.length,
                chatting: Object.keys(onChat).length
            });
        },
        
        sendMsg: (id, msg_data) => {
            online[id].socket.to( searchForUserId( msg_data.destination ) ).emit('message', { from: online[id].user, text: msg_data.text});
        }
    }
}