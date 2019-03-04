module.exports = () => {
    var online = {}, onWait = [], onChat={};

    setInterval(printStatus, 2000);

    function printStatus(){
        console.log(`${Object.keys(online).length} Online - ${onWait.length} Waiting for a chat - ${(Object.keys(onChat).length)*2} Chatting`);
    }

    function createChat(user1ID, user2ID){
        
        const roomID = user1ID + user2ID;
        
        online[user1ID].roomID = roomID;
        online[user2ID].roomID = roomID;

        console.log(`Chat room created for ${online[user1ID].user} and ${online[user2ID].user}`);
        
        if(!onChat[roomID]) onChat[roomID] = {
            roomID,
            participants: [ { user: online[user1ID].user, socket_id: online[user1ID].socket.id } , { user: online[user2ID].user, socket_id: online[user2ID].socket.id }],
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
        },
        
        initChat: (user1ID, user2_userName) => {
            const user2ID = searchForUserId(user2_userName);
            onWait = onWait.filter(el => el.socket_id !== user1ID );
            onWait = onWait.filter(el => el.socket_id !== user2ID );
            createChat(user1ID, user2ID);
        },

        sendRoomInfo: (socket) => {
            socket.emit('room-info', {
                online: Object.keys(online).length,
                waiting: onWait.length,
                chatting: Object.keys(onChat).length
            });
        },
        
        sendMsg: (id, msg_data) => {
            online[id].socket.to( onChat[msg_data.roomID].participants[msg_data.he].socket_id ).emit('message', { from: online[id].user, text: msg_data.text});
        },

        userDisconnect: (id) => {
			// Close ongoing game related to player if any
			console.log("On disconnect", id);
			if (online[id].roomID && onChat[online[id].roomID]) {
				const roomID = online[id].roomID;
				// Put all players back on onWait
				onChat[roomID].participants.map(participants => onWait.push(participants));
                // Delete match room
				delete onChat[online[id].roomID];
				// If the object gets deleted, reset it
				if (!onChat) onChat = {};
			}
            // Delete all instances of disconnecting player from waiting list (if any)
			onWait = onWait.filter(el => el.socket_id !== id);
			// Delete from players list
			if (online[id]) {
				delete online[id];
				if (!online) online = {};
			}
		}
    }
}