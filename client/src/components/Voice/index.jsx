import React, { useEffect, useRef, useState } from "react";
import "./index.css";

const ICE_SERVERS = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const Voice = ({ user, socket }) => {
    const [joined, setJoined] = useState(false);
    const [muted, setMuted] = useState(false);
    const [peerCount, setPeerCount] = useState(0);
    const [error, setError] = useState("");

    const joinedRef = useRef(false);
    const localStreamRef = useRef(null);
    const peersRef = useRef({}); // userId -> RTCPeerConnection
    const audioElsRef = useRef({}); // userId -> <audio> element

    useEffect(() => {
        joinedRef.current = joined;
    }, [joined]);

    const cleanupPeer = (peerId) => {
        const pc = peersRef.current[peerId];
        if (pc) {
            pc.close();
            delete peersRef.current[peerId];
        }
        const audioEl = audioElsRef.current[peerId];
        if (audioEl) {
            audioEl.remove();
            delete audioElsRef.current[peerId];
        }
        setPeerCount(Object.keys(peersRef.current).length);
    };

    const createPeerConnection = (peerId, isInitiator) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit("voice-signal", {
                    roomId: user.roomId,
                    from: user.userId,
                    to: peerId,
                    signal: { type: "candidate", candidate: e.candidate },
                });
            }
        };

        pc.ontrack = (e) => {
            let audioEl = audioElsRef.current[peerId];
            if (!audioEl) {
                audioEl = document.createElement("audio");
                audioEl.autoplay = true;
                document.body.appendChild(audioEl);
                audioElsRef.current[peerId] = audioEl;
            }
            audioEl.srcObject = e.streams[0];
        };

        pc.onconnectionstatechange = () => {
            if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
                cleanupPeer(peerId);
            }
        };

        peersRef.current[peerId] = pc;
        setPeerCount(Object.keys(peersRef.current).length);

        if (isInitiator) {
            pc.createOffer()
                .then((offer) => pc.setLocalDescription(offer))
                .then(() => {
                    socket.emit("voice-signal", {
                        roomId: user.roomId,
                        from: user.userId,
                        to: peerId,
                        signal: { type: "offer", sdp: pc.localDescription },
                    });
                });
        }

        return pc;
    };

    useEffect(() => {
        const handleVoiceUserJoined = ({ userId: peerId }) => {
            if (!joinedRef.current) return;
            if (peerId === user?.userId) return;
            if (peersRef.current[peerId]) return;
            createPeerConnection(peerId, true);
        };

        const handleVoiceUserLeft = ({ userId: peerId }) => {
            cleanupPeer(peerId);
        };

        const handleVoiceSignal = async ({ from, signal }) => {
            if (!joinedRef.current) return;

            if (signal.type === "offer") {
                const pc = peersRef.current[from] || createPeerConnection(from, false);
                await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit("voice-signal", {
                    roomId: user.roomId,
                    from: user.userId,
                    to: from,
                    signal: { type: "answer", sdp: pc.localDescription },
                });
            } else if (signal.type === "answer") {
                const pc = peersRef.current[from];
                if (pc) await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            } else if (signal.type === "candidate") {
                const pc = peersRef.current[from];
                if (pc) {
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
                    } catch (err) {
                        // ignore benign candidate errors
                    }
                }
            }
        };

        socket.on("voice-user-joined", handleVoiceUserJoined);
        socket.on("voice-user-left", handleVoiceUserLeft);
        socket.on("voice-signal", handleVoiceSignal);

        return () => {
            socket.off("voice-user-joined", handleVoiceUserJoined);
            socket.off("voice-user-left", handleVoiceUserLeft);
            socket.off("voice-signal", handleVoiceSignal);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, user]);

    const leaveVoice = () => {
        Object.keys(peersRef.current).forEach(cleanupPeer);
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((t) => t.stop());
            localStreamRef.current = null;
        }
        if (user?.roomId && user?.userId) {
            socket.emit("voice-leave", { roomId: user.roomId, userId: user.userId });
        }
        setJoined(false);
        setMuted(false);
    };

    const joinVoice = async () => {
        setError("");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;
            setJoined(true);
            socket.emit("voice-join", { roomId: user.roomId, userId: user.userId });
        } catch (err) {
            setError("Microphone access denied or unavailable.");
        }
    };

    const toggleMute = () => {
        if (!localStreamRef.current) return;
        const nextMuted = !muted;
        localStreamRef.current.getAudioTracks().forEach((track) => {
            track.enabled = !nextMuted;
        });
        setMuted(nextMuted);
    };

    // Leave voice automatically if the room/user is gone
    useEffect(() => {
        return () => {
            if (joinedRef.current) {
                leaveVoice();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="voice-widget">
            {error && <div className="voice-error">{error}</div>}
            {!joined ? (
                <button className="btn btn-outline-primary voice-btn" onClick={joinVoice}>
                    🎤 Join Voice
                </button>
            ) : (
                <div className="voice-active-controls d-flex align-items-center gap-2">
                    <span className="voice-status badge bg-success">
                        On call{peerCount > 0 ? ` · ${peerCount} connected` : ""}
                    </span>
                    <button
                        className={`btn btn-sm ${muted ? "btn-warning" : "btn-outline-secondary"}`}
                        onClick={toggleMute}
                    >
                        {muted ? "Unmute" : "Mute"}
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={leaveVoice}>
                        Leave Voice
                    </button>
                </div>
            )}
        </div>
    );
};

export default Voice;