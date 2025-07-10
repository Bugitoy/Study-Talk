"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/app/SocketProvider";
import setPcInstance from "@/lib/talk/pcInstance";

export default function LiveChat(
    remoteVideo: React.RefObject<HTMLVideoElement>, 
    setMessage: (message: string[]) => void, 
    updateUser: number, 
    peerConnection: RTCPeerConnection, 
    setPeerConnection: (pc: RTCPeerConnection) => void, 
    setStrangerData: (data: any) => void){

        const socket = useSocket();
        const [strangerUserId, setStrangerUserId] = useState('');
        const [strangerUsername, setStrangerUsername] = useState(null);
        const [connectionStatus, setConnectionStatus] = useState(false);
        const [dummyStrangerUserId, setDummyStrangerUserId] = useState<string | null>(null);
        const [removePair, setRemovePair] = useState(false);

        useEffect(() => {
            if (!socket) return;
            if (socket && !strangerUsername){
                socket.emit('startConnection');
                setRemovePair(true);
            }
        }, [socket, strangerUsername]);

        useEffect(() => {
            if (!socket) return;
            if (socket){
                socket.on('getStrangerData', (data: any) => {
                    setStrangerData(data);
                    setStrangerUserId(data.pairedUserId);
                    setStrangerUsername(data.strangerUsername);
                    setConnectionStatus(true);
            })
            socket.on('strangerLeftTheChat', clearState)
            socket.on('errSelectingPair', () => socket.emit('startConnetion'))

            return () => {
                socket.removeAllListeners('getStrangerData')
                socket.removeAllListeners('strangerLeftTheChat')
                socket.removeAllListeners('errMakingPair')
            }
        }
    }, [socket]);

    function clearState() {
        setStrangerData(null);
        setStrangerUserId(' ');
        setStrangerUsername(null);
        setConnectionStatus(false);
        if (remoteVideo.current) {
            remoteVideo.current.srcObject = null;
        }
        setMessage([]);

        if (peerConnection.signalingState !== 'closed') peerConnection.close();
        const pcInstance = setPcInstance();
        setPeerConnection(pcInstance);
    }

    useEffect(() => {
        if (updateUser > 0) {
            setDummyStrangerUserId(strangerUserId);
            clearState();

            return () => {
                setDummyStrangerUserId(null);
            }
        }
    }, [updateUser])

    useEffect(() => {
        if (removePair && dummyStrangerUserId && socket) socket.emit('pairedUserLeftTheChat', dummyStrangerUserId);
    }, [removePair, dummyStrangerUserId])
    
    useEffect(() => {
        if (socket && !strangerUsername) {
            window.addEventListener('beforeunload', () => socket.emit("soloUserLeftTheChat"));
        } else {
            window.addEventListener('beforeunload', () => socket?.emit("pairedUserLeftTheChat", strangerUserId))
        }
    }, [socket, strangerUsername])
    
    return { socket, strangerUserId, strangerUsername, connectionStatus };
}
