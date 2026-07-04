import rough from "roughjs/bundled/rough.esm";
import React, { useEffect, useState, useLayoutEffect } from "react";

const roughGenerator = rough.generator();


const WhiteBoard = ({ canvasref, ctxref, elements, setElements, tool, color,user,socket }) => {
    const [imgURL, setImgURL] = useState(null);  
    useEffect(() => {
        socket.on("WhiteBoardDataResponse", (data) => {
            setImgURL(data.imgURL);
        });
    }, []);
    
    if(!user?.presenter){
        return(
        <div          
            className="border border-dark border-3 overflow-hidden"
            style={{ width: "100%", height: "100%" }} >

        <img src={imgURL} alt="Real time white board image shared by presenter "
        style={{
            height:window.innerHeight*2,
            width:"285%",}} />
        </div>
        );        
    }
    const [isDrawing, setIsDrawing] = useState(false);
    

  

    useEffect(() => {
        const canvas = canvasref.current;
        canvas.height = window.innerHeight * 2;
        canvas.width = window.innerWidth * 2;

        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        ctxref.current = ctx;

        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.lineCap = "round";
        ctx.fillStyle = "transparent";
    }, []);

    useEffect(() => {
        ctxref.current.strokeStyle = color;
    }, [color]);

    useLayoutEffect(() => {
        const canvas = canvasref.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if(canvas){
        const roughCanvas = rough.canvas(canvas);
        elements.forEach((ele) => {
            if (ele.type === "pencil") {
                roughCanvas.linearPath(ele.path, {
                    stroke: ele.stroke,
                    strokeWidth: 5,
                    roughness: 0,
                });
            } else if (ele.type === "line") {
                roughCanvas.line(
                    ele.offsetX,
                    ele.offsetY,
                    ele.offsetX + ele.width,
                    ele.offsetY + ele.height,
                    {
                        stroke: ele.stroke,
                        strokeWidth: 5,
                        roughness: 0,
                    }
                );
            }
            else if (ele.type === "rectangle") {
                roughCanvas.rectangle(
                ele.offsetX,
                ele.offsetY,
                ele.width,
                ele.height,
                {
                    stroke: ele.stroke,
                    strokeWidth: 5,
                    roughness: 0,
                }
            );
        }
        else if (ele.type === "circle") {
            ctx.beginPath();

            const radius = Math.abs(
                Math.min(ele.width, ele.height)
            ) / 2;

            ctx.arc(
                ele.offsetX + ele.width / 2,
                ele.offsetY + ele.height / 2,
                radius,
                0,
                2 * Math.PI
            );

            ctx.strokeStyle = ele.stroke;
            ctx.lineWidth = 5;
            ctx.stroke();
        }
        else if (ele.type === "eraser") {
            ctx.save();
            ctx.globalCompositeOperation = "destination-out";
            ctx.lineWidth = 20;
            ctx.lineCap = "round";

            ctx.beginPath();

            ele.path.forEach(([x, y], index) => {
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();
            ctx.restore();
        }
        });
        const canvasImage=canvasref.current.toDataURL();
        socket.emit("WhiteboardData",canvasImage);
    }
    }, [elements]);

    const startDrawing = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;

        if (tool === "pencil") {
            setElements((prevElements) => [
                ...prevElements,
                {
                    type: "pencil",
                    offsetX,
                    offsetY,
                    path: [[offsetX, offsetY]],
                    stroke: color,
                },
            ]);
        } else if (tool === "line") {
            setElements((prevElements) => [
                ...prevElements,
                {
                    type: "line",
                    offsetX,
                    offsetY,
                    width: 0,
                    height: 0,
                    stroke: color,
                },
            ]);
        }
        else if (tool === "rectangle") {
            setElements((prevElements) => [
                ...prevElements,
                {
                    type: "rectangle",
                    offsetX,
                    offsetY,
                    width: 0,
                    height: 0,
                    stroke: color,
                },
            ]);
        }
        else if (tool === "circle") {
            setElements((prevElements) => [
                ...prevElements,
                {
                    type: "circle",
                    offsetX,
                    offsetY,
                    radius: 0,
                    stroke: color,
                },
            ]);
        }
        else if (tool === "eraser") {
            setElements((prevElements) => [
                ...prevElements,
                {
                    type: "eraser",
                        path: [[offsetX, offsetY]],
                },
            ]);
        }
        setIsDrawing(true);
    };

    const draw = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;

        if (!isDrawing || elements.length === 0) return;

        if (tool === "pencil"||tool === "eraser") {
            const { path } = elements[elements.length - 1];
            const newPath = [...path, [offsetX, offsetY]];

            setElements((prevElements) =>
                prevElements.map((ele, index) => {
                    if (index === prevElements.length - 1) {
                        return {
                            ...ele,
                            path: newPath,
                        };
                    }
                    return ele;
                })
            );
        } else if (tool === "line" || tool === "rectangle") {
            setElements((prevElements) =>
                prevElements.map((ele, index) => {
                    if (index === prevElements.length - 1) {
                        return {
                            ...ele,
                            width: offsetX - ele.offsetX,
                            height: offsetY - ele.offsetY,
                        };
                    }
                    return ele;
                })
            );
        }
        else if (tool === "circle") {
            setElements((prevElements) =>
                prevElements.map((ele, index) => {
                    if (index === prevElements.length - 1) {
                        return {
                            ...ele,
                            width: offsetX - ele.offsetX,
                    height: offsetY - ele.offsetY,
                };
            }
            return ele;
        })
    );
}
    };

    const stopDrawing = () => {
        if (ctxref.current) {
            ctxref.current.closePath();
        }
        setIsDrawing(false);
    };
    

    return (
        <div       
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            className="border border-dark border-3 overflow-hidden"
            style={{ width: "100%", height: "100%" }} >

        <canvas
            ref={canvasref}/>
        </div>
    );
};

export default WhiteBoard;