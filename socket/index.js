const io = require("socket.io")(8900, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => {
    return user.socketId !== socketId;
  });
  console.log(users);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("a user connected.");
  //how to send event to every client
  //In server we will always use IO object

  //When Connected
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //This recieves the message BUT sends IT TO THE RECIEVER FROM YOU!!!!!
  socket.on("sendMessage", ({ senderId, recieverId, text }) => {
    //Get user
    const user = getUser(recieverId);

    //Send message to that potential receiver with a tag, senderId, and the text
    io.to(user?.socketId).emit("getMessage", {
      senderId,
      text,
    });
  });

  //Get Message

  //When Disconnected
  //Listening to a disconnect? takes them off array
  socket.on("disconnect", () => {
    console.log("user disconnected");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
