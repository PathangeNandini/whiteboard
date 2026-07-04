import React, { useRef, useState } from "react";
import "./index.css";
import WhiteBoard from "../../components/Whiteboard";

const RoomPage = ({user,socket,users}) => {
    console.log("RoomPage user:", user);
    const canvasref=useRef(null);
    const ctxref=useRef(null);

    const [tool,setTool] = useState("pencil");
    const [color, setColor]=useState("black");
    const [elements, setElements] = useState([]);
    const [history, setHistory] = useState([]);
    const [openedUserTab,setOpenedUserTab] = useState(false);

    const handleclearcanvas=()=>{
        const canvas = canvasref.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setElements([]);
    }
    const undo=()=>{
        if(elements.length===0) return;
        const newElements = [...elements];
        const poppedElement = newElements.pop();
        setElements(newElements);
        setHistory((prevHistory) => [...prevHistory, poppedElement]);
    }
    const redo=()=>{
        if(history.length===0) return;
        const newHistory = [...history];
        const poppedElement = newHistory.pop();
        setElements((prevElements) => [...prevElements, poppedElement]);
        setHistory(newHistory);
    }
  return (
    
    <div className="container-fluid">
    <button type ="button" className="btn btn-dark" onClick={() => setOpenedUserTab(!openedUserTab)}>
        Users
    </button>
    {!openedUserTab && (
        <div className="col-md-2 position-fixed top-0 end-0 bg-light p-3 border" style={{height: "100vh", overflowY: "auto"}}>
            <h4>Users in Room</h4>
            <button type="button" className="btn btn-light btn-block w-100 mt-5" onClick={() => setOpenedUserTab(false)}>
                Close
            </button>
            {users.map((usr,index)=>(
                <div key={index} className="d-flex align-items-center justify-content-between border p-2 mb-2">
                    <span>{usr.name}</span>
                    {usr.presenter && <span className="badge bg-primary">Presenter</span>}
                </div>
            ))}
            </div>)}
      <h1 className="text-center py-4">White Board Sharing App
         <span className="text-primary">[Users Online: {users.length}]</span>
    </h1>
    

        {user?.presenter &&(
            <div className="col-md-12 px-4 mt-4 mb-5 d-flex align-items-center justify-content-between">
        <div className="col-md-5 d-flex justify-content-between gap-2">
            <label htmlFor="pencil">Pencil</label>
            <input type="radio" name="tool" id="pencil" value="pencil" checked={tool === "pencil"} onChange={(e) => setTool(e.target.value)} checked={tool === "pencil"} />
            <label htmlFor="line">Line</label>
            <input type="radio" name="tool" id="line" value="line" checked={tool === "line"} onChange={(e) => setTool(e.target.value)} checked={tool=== "line"} />
            <label htmlFor="rectangle">Rectangle</label>
            <input type="radio" name="tool" id="rectangle" value="rectangle" checked={tool === "rectangle"} onChange={(e) => setTool(e.target.value)} checked={tool=== "rectangle"} />
            <label htmlFor="circle">Circle</label>
            <input type="radio" name="tool" id="circle" value="circle" checked={tool === "circle"} onChange={(e) => setTool(e.target.value)} checked={tool === "circle"} />
            <label htmlFor="eraser">Eraser</label>
            <input type="radio" name="tool" id="eraser" value="eraser" checked={tool === "eraser"} onChange={(e) => setTool(e.target.value)} checked={tool === "eraser"} />
        </div>
        <div className="col-md-2 d-flex align-items-center justify-content-center">
            <div className="d-flex align-items-center">
                <label htmlFor="color">Select Color:</label>
                <input 
                type="color" 
                className="mt-1 ms-3" id="color" value={color} 
                onChange={(e) => setColor(e.target.value)} 
                />
            </div>
        </div>
        <div className="col-md-2 d-flex justify-content-center gap-2">
            <button className="btn btn-primary mt-1"
            disabled={elements.length === 0}
            onClick={() => undo()}
            
            >Undo</button>
            <button className="btn btn-outline-primary mt-1"
            disabled={history.length === 0}
            onClick={() => redo()}
            
            >Redo</button>
        </div>
        <div className="col-md-2 d-flex gap-2">
            <button className="btn btn-success mt-1">Save</button>
            <button className="btn btn-danger mt-1" onClick={handleclearcanvas}>Clear</button>
        </div>
      </div>
            )
        }
      
      <div className="col-md-12  mx-auto mt-4 border "style={{height: "80vh"}}>    
        <WhiteBoard 
        canvasref={canvasref} 
        ctxref={ctxref}
        elements={elements}
        setElements={setElements}
        color={color}
        tool={tool}
        user={user}
        socket={socket}
         />  
        </div>
    </div>
  );
};

export default RoomPage;