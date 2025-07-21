"use client";
import React, { useEffect } from "react";
import openMediaStream from "@/lib/talk/openMediaStream";

export default function LocalVideo({ 
    localVideo, 
    peerConnection, 
    setChangeCamOverly, 
    setStream, 
    stream,  
    selectedDeviceId }: {
        localVideo: React.RefObject<HTMLVideoElement>, 
        peerConnection: RTCPeerConnection, 
        setChangeCamOverly: (value: boolean) => void, 
        setStream: (stream: MediaStream) => void, 
        stream: MediaStream, 
        selectedDeviceId: string
    }) {
        
        useEffect(() => {
            if (peerConnection) {
                let streamInstance: MediaStream | null = null;
                const handleMediaStream = async () => {
                    const stream = await openMediaStream(selectedDeviceId);
                    if (stream) {
                        streamInstance = stream;
                        if (localVideo.current) {
                            localVideo.current.srcObject = streamInstance;
                        }
                        setStream(streamInstance);
                    } else {
                        streamInstance = null;
                    }
                };
                try {
                    if (localVideo.current) handleMediaStream();
                } catch (error) {
                    console.error("Error setting up media stream:", error);
                }
                return () => {
                    if (streamInstance && streamInstance.getVideoTracks()[0]) {
                        streamInstance.getVideoTracks()[0].stop();

                    }
                }
            }
    }, [peerConnection])

    useEffect(() => {
        if (stream) {
            return () => {
                const videoTracks = stream.getVideoTracks();
                if (videoTracks.length > 0) {
                    videoTracks[0].stop();
                }
            }
        }
    }, [stream])

    return <video className='w-[100%] h-[48vh] bg-slate-300 rounded-[10px] mb-[1.5%] object-cover'
    ref={localVideo}
    onClick={() => setChangeCamOverly(true)}
    autoPlay
    playsInline
    controls={false}
    muted
    ></video>
}
