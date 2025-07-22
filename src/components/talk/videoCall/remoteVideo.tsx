"use client"

import React, { useEffect } from "react";

export default function RemoteVideo({ 
    remoteVideo, 
    peerConnection, 
    setChangeCamOverly }: {
        remoteVideo: React.RefObject<HTMLVideoElement>, 
        peerConnection: RTCPeerConnection, 
        setChangeCamOverly: (value: boolean) => void
    }) {

    useEffect(() => {
        if (peerConnection) {
            // peerConnection.ontrack = ({ track, streams }) => {
            //      track.onmute = () => {
            //        if (remoteVideo.current.srcObject) {
            //            return;
            //        }
            //        remoteVideo.current.srcObject = streams[0];
            //       };
            //      }
            peerConnection.addEventListener('track', async (event) => {
                const [remoteStream] = event.streams;
                if (remoteVideo.current) remoteVideo.current.srcObject = remoteStream;
            })

            return () => {
                if (remoteVideo.current) remoteVideo.current.srcObject = null;
            }
        }
    }, [peerConnection])

    return <video className='w-[100%] h-[36.5vh] sm:h-[40vh] lg:h-[48vh] bg-slate-300 rounded-[10px] object-cover'
    ref={remoteVideo}
    onClick={() => setChangeCamOverly(true)}
    autoPlay
    playsInline
    controls={false}
    ></video>
}