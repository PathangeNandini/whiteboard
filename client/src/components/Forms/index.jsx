import CreateRoomForm from "./Createroomform";
import JoinRoomForm from "./JoiningRoomform";
import "./index.css";

const Forms=({ uuid , socket , setUser })=>{
    return (
        <div className="row h-100 pt-5">
            <div className="col-md-4 mt-5 form-box p-5 border border-primary rounded-2 mx-auto d-flex flex-column align-items-center">
                <h2 className="text-primary fw-bold">Create Room</h2>
                <CreateRoomForm uuid={uuid} socket={socket} setUser={setUser} />
                
            </div>
            <div className="col-md-4 mt-5 form-box p-5 border border-primary rounded-2 mx-auto d-flex flex-column align-items-center">
                <h2 className="text-primary fw-bold">Join Room</h2>
                <JoinRoomForm socket={socket} setUser={setUser} />
                
            </div>
        </div>
    )
};
export default Forms;