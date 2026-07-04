const express=require('express');
const app=express();
const server=require('http').createServer(app);
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users');

const {Server}=require("socket.io");
const io=require('socket.io')(server,{
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});




//routes
app.get('/',(req,res)=>{
    res.send(
        `<h1>Welcome to the Whiteboard Server</h1>
        <p>Use Socket.IO to connect and interact with the whiteboard.</p>`
    );
});

let roomIdGlobal,imgURLGlobal;
const socketIdByUserId = {};

io.on('connection',(socket)=>{
    socket.on('userJoined',(roomData)=>{
        const{name,roomId,userId,host,presenter}=roomData;
        roomIdGlobal=roomId;
        //console.log(`User ${roomData.name} joined room ${roomData.roomId}`);

        socketIdByUserId[userId] = socket.id;
        socket.join(roomData.roomId);
        const users=addUser(roomData);
        socket.emit('userJoined', {success: true, roomId: roomData.roomId, userId: roomData.userId,users});
        socket.broadcast.to(roomData.roomId).emit("userJoinedMessageBroadcasted",name);
        socket.emit("allUsersInRoom",users);
        socket.broadcast.to(roomData.roomId).emit('userJoined', {success: true, roomId: roomData.roomId, userId: roomData.userId,users});
        socket.broadcast.to(roomIdGlobal).emit("WhiteBoardDataResponse",{
            imgURL:imgURLGlobal,
        })
    });
    socket.on("WhiteboardData",(data)=>{
        imgURLGlobal = data ;
        socket.broadcast.to(roomIdGlobal).emit("WhiteBoardDataResponse",{   
            imgURL:data,
        });
    })
    socket.on("userLeft",(data)=>{
        const {name,roomId,userId}=data;
        removeUser(userId);
        delete socketIdByUserId[userId];
        socket.broadcast.to(roomId).emit("userLeftMessageBroadcasted",name);
        socket.broadcast.to(roomId).emit("allUsersInRoom",getUsersInRoom(roomId));
        socket.broadcast.to(roomId).emit("voice-user-left",{userId});
    });
    socket.on("message",(data)=>{
        const {roomId,name,message}=data;
        io.to(roomId).emit("messageResponse",{
            name,
            message,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
    });

    // --- Voice call signaling (1-to-1 / small group mesh) ---
    socket.on("voice-join",(data)=>{
        const {roomId,userId}=data;
        socket.broadcast.to(roomId).emit("voice-user-joined",{userId});
    });
    socket.on("voice-leave",(data)=>{
        const {roomId,userId}=data;
        socket.broadcast.to(roomId).emit("voice-user-left",{userId});
    });
    socket.on("voice-signal",(data)=>{
        const targetSocketId = socketIdByUserId[data.to];
        if (targetSocketId) {
            io.to(targetSocketId).emit("voice-signal",data);
        }
    });

});

const port=process.env.PORT || 5000;

server.listen(port,()=>{
    console.log(`Server is running on port http://localhost:${port}`);
});