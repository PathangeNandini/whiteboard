import React, { useEffect, useRef, useState } from "react";
import "./index.css";

const Chat = ({ user, socket }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [unread, setUnread] = useState(0);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const handleMessage = (data) => {
            setMessages((prev) => [...prev, data]);
        };
        socket.on("messageResponse", handleMessage);
        return () => {
            socket.off("messageResponse", handleMessage);
        };
    }, [socket]);

    useEffect(() => {
        if (isOpen) {
            setUnread(0);
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        } else if (messages.length > 0) {
            setUnread((prev) => prev + 1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!text.trim() || !user?.roomId) return;

        socket.emit("message", {
            roomId: user.roomId,
            name: user.name,
            message: text.trim(),
        });
        setText("");
    };

    return (
        <div className="chat-widget">
            {isOpen && (
                <div className="chat-panel shadow">
                    <div className="chat-header d-flex align-items-center justify-content-between px-3 py-2">
                        <span className="fw-bold">Room Chat</span>
                        <button
                            className="btn-close btn-close-white"
                            aria-label="Close chat"
                            onClick={() => setIsOpen(false)}
                        ></button>
                    </div>
                    <div className="chat-messages px-3 py-2">
                        {messages.length === 0 && (
                            <p className="text-muted small text-center mt-3">
                                No messages yet. Say hi!
                            </p>
                        )}
                        {messages.map((msg, idx) => {
                            const isOwn = msg.name === user?.name;
                            return (
                                <div
                                    key={idx}
                                    className={`chat-message-row d-flex ${
                                        isOwn ? "justify-content-end" : "justify-content-start"
                                    }`}
                                >
                                    <div
                                        className={`chat-bubble ${
                                            isOwn ? "chat-bubble-own" : "chat-bubble-other"
                                        }`}
                                    >
                                        {!isOwn && (
                                            <div className="chat-sender">{msg.name}</div>
                                        )}
                                        <div>{msg.message}</div>
                                        <div className="chat-time">{msg.time}</div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                    <form className="chat-input-area d-flex gap-2 p-2" onSubmit={sendMessage}>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Type a message..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary btn-sm">
                            Send
                        </button>
                    </form>
                </div>
            )}

            <button
                className="chat-toggle-btn btn btn-primary"
                onClick={() => setIsOpen((prev) => !prev)}
            >
                💬
                {!isOpen && unread > 0 && (
                    <span className="chat-badge">{unread}</span>
                )}
            </button>
        </div>
    );
};

export default Chat;