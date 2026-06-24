import {useState} from "react";
import {useNavigate}from "react-router-dom";
import { v4 as uuid } from "uuid";

const JoinRoomForm = ({ socket, setUser }) => {
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const navigate=useNavigate();

  const handleroomjoin=(e)=>{
    e.preventDefault();
    const roomData={
      name,
      roomId,
      userId:uuid(),
      host:false,
      presenter:false,
    };
    setUser(roomData);
    navigate(`/${roomId}`);
    socket.emit("userJoined",roomData);
  }
  
  return (
    <form className="form col-md-12 mt-5">
      <div className="form-group">
        <label htmlFor="roomName">Room Name</label>
        <input type="text" className="form-control my-2" 
        id="roomName" 
        placeholder="Enter room name" 
        value={name}
        onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="form-group">        
            <input type="text"
            className="form-control my-2" 
            id="roomPassword" 
            placeholder="Enter room password"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)} />
               
      </div>      
      <button type="submit" onClick={handleroomjoin} className="mt-4 btn-primary btn-block form-control">
        Join Room
      </button>
    </form>
  )
};
export default JoinRoomForm;