import { search, addRoom, updateRoom } from "./Elasticsearch";
import { v4 as uuidv4 } from "uuid";

const getRandomRoom = () => {
  return uuidv4();
};

const connect = (server: any) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  var numClients: number[] = [];
  io.on("connection", (socket: any) => {
    console.log("Connected");

    socket.on(
      "search-for-game",
      (roomType: any, playerID: any, roomID: any = null) => {
        if (!roomID)
          search().then((room: any) => {
            if (room.length > 0) {
              console.log("ROOM IS FOUND");
              let varRoom = room[0];
              socket.emit("game-found", varRoom._source.room_id);
              //UPDATEROOM DISABLE ROOM
              updateRoom({ doc: { is_active: false } }, varRoom._id);
            } else {
              console.log("ROOM IS NOT FOUND... Creating new Room...");
              const newRoomID = getRandomRoom();
              addRoom({
                room_id: newRoomID,
                player_id: playerID,
                room_type: "public",
                date: new Date(),
                is_active: true,
              }).then((room: any) => {
                socket.emit("game-found", newRoomID);
                console.log("room created");
              });
            }
          });
        else {
          socket.emit("game-found", roomID);
          if (!numClients[roomID])
            addRoom({
              room_id: roomID,
              player_id: playerID,
              room_type: "prive",
              date: new Date(),
              is_active: true,
            });
        }

        //   socket.broadcast.emit("game-found", "userId");
      }
    );

    socket.on("join-room", (roomId: any, userId: string) => {
      console.log(numClients);
      if (numClients[roomId] == undefined) {
        numClients[roomId] = 1;
      } else {
        numClients[roomId]++;
      }
      if (numClients[roomId] < 3) {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit("player-connected", userId);
      }
      socket.on(
        "game-ready",
        (user: any, playerType: any, nbOfPlayers: any) => {
          socket
            .to(roomId)
            .broadcast.emit("game-ready", user, playerType, nbOfPlayers);
        }
      );

      socket.on(
        "turn-end",
        (nextTornadoCoordinates: any, tornadoDeciser: any) => {
          console.log("turn");
          socket
            .to(roomId)
            .broadcast.emit("turn-end", nextTornadoCoordinates, tornadoDeciser);
        }
      );

      socket.on("action-done", (grid: any, playerX: any, playerY: any) => {
        console.log("action done");
        socket.to(roomId).broadcast.emit("action-done", grid, playerX, playerY);
      });

      socket.on("send-message", (message: any) => {
        console.log("Message Sent");
        socket.to(roomId).broadcast.emit("receive-message", message);
      });

      socket.on("leave-room", () => {
        socket.to(roomId).broadcast.emit("player-disconnected", userId);
        if (numClients[roomId]) numClients[roomId]--;
      });
      socket.on("disconnect", () => {
        socket.to(roomId).broadcast.emit("player-disconnected", userId);
        if (numClients[roomId]) numClients[roomId]--;
      });
    });
  });
};

export default connect;
