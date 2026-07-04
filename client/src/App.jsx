import { Route,Routes } from "react-router-dom";
import io from "socket.io-client";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";

import Forms from "./components/Forms";
import RoomPage from "./pages/RoomPage";

import "./App.css";

const server = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
const connectionOptions = {
  "force new connection": true,
  "reconnectionAttempts": "Infinity",
  "timeout": 10000,
  "transports": ["websocket"]
};

const socket=io(server,connectionOptions);

const App = () => {

  const[user,setUser]=useState("");
  const [users,setUsers]=useState([]);

  useEffect(() => {
    socket.on('userJoined', (data) => {
      if (data.success) {
        console.log(`User joined room ${data.roomId} with userId ${data.userId}`);
        
        setUser((prevUser) => ({
          ...prevUser,
          roomId: data.roomId,
          userId: data.userId,
        }));
        if (data.users) {
          setUsers(data.users);
        }
      } else {
        console.error('Failed to join room');
      }
    });
    socket.on("allUsersInRoom", (users) => {
      setUsers(users);
    });
    socket.on("userJoinedMessageBroadcasted", (name) => {
      toast.success(`${name} joined the room`, { theme: "colored" });
    });
    socket.on("userLeftMessageBroadcasted", (name) => {
      toast.error(`${name} left the room`, { theme: "colored" });
    });
    
  }, []);

  const uuid = () => {
    var S4=()=>{
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  };
  return (
    <div className="container">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop />
      <Routes>
        <Route path="/" element={<Forms uuid={uuid} socket={socket} setUser={setUser} />} />
        <Route path="/:roomId" element={<RoomPage user={user} socket={socket} users={users}/>} />
      </Routes>
    </div>
  );
};

export default App;