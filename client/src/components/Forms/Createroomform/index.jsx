import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./index.css";

const CreateRoomForm = ({ uuid , socket ,setUser}) => {
  const [roomId, setRoomId] = useState(uuid());
  const [name, setName] = useState("");

  const navigate = useNavigate();

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId)
      .then(() => toast.success("Room ID copied to clipboard"))
      .catch(() => toast.error("Could not copy Room ID"));
  };

  const handlecreateroom = (e) => {
    e.preventDefault();
    const roomData = {
      roomId: roomId,
      name: name,
      userId: uuid(),
      host: true,
      presenter: true,
    };
    console.log(roomData);
    setUser(roomData);
    navigate(`/${roomId}`);
    socket.emit("userJoined", roomData);
    // Handle form submission logic here
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
      <div className="form-group border">
        <div className="input-group d-flex align-items-center justify-content-center">
            <input type="text"
            value ={roomId}
            className="form-control my-2 border-0" 
            disabled
            id="roomPassword" 
            placeholder="Generate room password" />
            <div className="input-group-append">
                <button className="btn btn-primary btn-sm me-1" type="button" onClick={() => setRoomId(uuid())}>
                    Generate
                </button>
                <button className="btn btn-outline-danger btn-sm me-2" type="button" onClick={handleCopy}>
                    Copy
                </button>
            </div>  
        </div>        
      </div>      
      <button type="submit" onClick={handlecreateroom} className="mt-4 btn-primary btn-block form-control">
        Generate Room
      </button>
    </form>
  )
};
export default CreateRoomForm;