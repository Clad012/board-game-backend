"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Elasticsearch_1 = require("./Elasticsearch");
const uuid_1 = require("uuid");
const getRandomRoom = () => {
    return uuid_1.v4();
};
const connect = (server) => {
    const io = require("socket.io")(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    var numClients = [];
    io.on("connection", (socket) => {
        console.log("Connected");
        socket.on("search-for-game", (roomType, playerID, roomID = null) => {
            if (!roomID)
                Elasticsearch_1.search().then((room) => {
                    if (room.length > 0) {
                        console.log("ROOM IS FOUND");
                        let varRoom = room[0];
                        socket.emit("game-found", varRoom._source.room_id);
                        //UPDATEROOM DISABLE ROOM
                        Elasticsearch_1.updateRoom({ doc: { is_active: false } }, varRoom._id);
                    }
                    else {
                        console.log("ROOM IS NOT FOUND... Creating new Room...");
                        const newRoomID = getRandomRoom();
                        Elasticsearch_1.addRoom({
                            room_id: newRoomID,
                            player_id: playerID,
                            room_type: "public",
                            date: new Date(),
                            is_active: true,
                        }).then((room) => {
                            socket.emit("game-found", newRoomID);
                            console.log("room created");
                        });
                    }
                });
            else {
                socket.emit("game-found", roomID);
                if (!numClients[roomID])
                    Elasticsearch_1.addRoom({
                        room_id: roomID,
                        player_id: playerID,
                        room_type: "prive",
                        date: new Date(),
                        is_active: true,
                    });
            }
            //   socket.broadcast.emit("game-found", "userId");
        });
        socket.on("join-room", (roomId, userId) => {
            console.log(numClients);
            if (numClients[roomId] == undefined) {
                numClients[roomId] = 1;
            }
            else {
                numClients[roomId]++;
            }
            if (numClients[roomId] < 3) {
                socket.join(roomId);
                socket.to(roomId).broadcast.emit("player-connected", userId);
            }
            socket.on("game-ready", (user, playerType, nbOfPlayers) => {
                socket
                    .to(roomId)
                    .broadcast.emit("game-ready", user, playerType, nbOfPlayers);
            });
            socket.on("turn-end", (nextTornadoCoordinates, tornadoDeciser) => {
                console.log("turn");
                socket
                    .to(roomId)
                    .broadcast.emit("turn-end", nextTornadoCoordinates, tornadoDeciser);
            });
            socket.on("action-done", (grid, playerX, playerY) => {
                console.log("action done");
                socket.to(roomId).broadcast.emit("action-done", grid, playerX, playerY);
            });
            socket.on("send-message", (message) => {
                console.log("Message Sent");
                socket.to(roomId).broadcast.emit("receive-message", message);
            });
            socket.on("leave-room", () => {
                socket.to(roomId).broadcast.emit("player-disconnected", userId);
                if (numClients[roomId])
                    numClients[roomId]--;
            });
            socket.on("disconnect", () => {
                socket.to(roomId).broadcast.emit("player-disconnected", userId);
                if (numClients[roomId])
                    numClients[roomId]--;
            });
        });
    });
};
exports.default = connect;
//# sourceMappingURL=Socket.js.map