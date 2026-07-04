const express=require('express');
const app=express();
const server=require('http').createServer(app);
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users');

const {Server}=require("socket.io");
const io=require('socket.io')(server);




//routes
app.get('/',(req,res)=>{
    res.send(
        `<h1>Welcome to the Whiteboard Server</h1>
        <p>Use Socket.IO to connect and interact with the whiteboard.</p>`
    );
});

let roomIdGlobal,imgURLGlobal;
io.on('connection',(socket)=>{
    socket.on('userJoined',(roomData)=>{
        const{name,roomId,userId,host,presenter}=roomData;
        roomIdGlobal=roomId;
        //console.log(`User ${roomData.name} joined room ${roomData.roomId}`);

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

});

const port=process.env.PORT || 5000;

server.listen(port,()=>{
    console.log(`Server is running on port http://localhost:${port}`);
});