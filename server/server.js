const express=require('express');
const app=express();

const server=require('http').createServer(app);
const {Server}=require("socket.io");

const io=require('socket.io')(server);

//routes
app.get('/',(req,res)=>{
    res.send(
        `<h1>Welcome to the Whiteboard Server</h1>
        <p>Use Socket.IO to connect and interact with the whiteboard.</p>`
    );
});

io.on('connection',(socket)=>{
    socket.on('userJoined',(roomData)=>{
        console.log(`User ${roomData.name} joined room ${roomData.roomId}`);
        socket.join(roomData.roomId); 
        socket.emit('userJoined', {success: true, roomId: roomData.roomId, userId: roomData.userId});
    })
});

const port=process.env.PORT || 5000;

server.listen(port,()=>{
    console.log(`Server is running on port http://localhost:${port}`);
});