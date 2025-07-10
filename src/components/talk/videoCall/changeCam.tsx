"use client";
import React, { useState, useEffect, useRef } from "react";
import { getConnectedDevices, changeCam, changePreviewCam } from "@/lib/talk/changeCamUtils";
import openMediaStream from "@/lib/talk/openMediaStream";

export default function ChangeLocalMediaStream({ 
    peerConnection, 
    localVideo, 
    ChangeCamOverly, 
    setChangeCamOverly,
    selectedDeviceId,
    setSelectedDeviceId, 
    setStream }: {
        peerConnection: RTCPeerConnection, 
        localVideo: HTMLVideoElement, 
        ChangeCamOverly: boolean, 
        setChangeCamOverly: (value: boolean) => void, 
        selectedDeviceId: string,
        setSelectedDeviceId: (deviceId: string) => void, 
        setStream: (stream: MediaStream) => void
    }) {
        const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
        const[dropdownOpen, setDropdownOpen] = useState(false);
        const videoPreview = useRef<HTMLVideoElement>(null);
        const dropdownRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            if (ChangeCamOverly) {
                let streamInstance: MediaStream | null = null;
                const setupDeviceAndStream = async () => {
                    const deviceInstance = await getConnectedDevices();
                    setDevices(deviceInstance);

                    const stream = await openMediaStream(deviceInstance[0].deviceId);
                    if (stream) {
                        streamInstance = stream;
                        if (videoPreview.current) videoPreview.current.srcObject = streamInstance;
                        setStream(streamInstance);
                    } else {
                        streamInstance = null;
                    }
                }

                try {
                    setupDeviceAndStream();
                } catch (error) {
                    console.error("Error setting up device and stream:", error);
                }

                return () => {
                    if (streamInstance && streamInstance.getVideoTracks()[0]) {
                        streamInstance.getVideoTracks()[0].stop();
                    }
                }
            }
        }, [ChangeCamOverly]);
        
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setDropdownOpen(false);
                }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, []);

        if (!ChangeCamOverly) return null;
        return (
            <div className='fixed top-0 left-0 w-[100%] h-[100%] bg-[rgba(0, 0, 0, 0.7)] 
                            flex justify-center items-center z-10'>
                <div className='bg-[rgba(255, 255, 255, 0.1)] rounded-[20px] p-[30px] flex 
                                flex-col items-center backdrop-blur-[10px] 
                                box-shadow-[0_4px_6px_rgba(0, 0, 0, 0.1)] w-[90%] max-w-[400px]'>

                    <video className='w-[100%] aspect-video rounded-[10px] mb-[20px] object-cover' 
                           ref={videoPreview} autoPlay playsInline controls={false} muted></video>

                    <div ref={dropdownRef}
                         className={`w-full mb-[20px] relative ${dropdownOpen ? "active" : ""}`}
                    >
                        <button className="bg-thanodi-peach text-white py-[12px] px-[20px] 
                                           text-[16px] border-none cursor-pointer w-[100%] rounded-[5px] 
                                           transition-colors duration-300 hover:bg-thanodi-lightPeach
                                           focus:bg-thanodi-lightPeach items-center" 
                                           onClick={() => setDropdownOpen(!dropdownOpen)}
                        >Select Camera</button>

                        <div className={`absolute bg-slate-200 min-w-[100%] rounded-[5px] 
                                         max-h-[200px] overflow-y-auto mt-[5px] z-10 shadow-md text-center 
                                         ${dropdownOpen ? 'block' : 'hidden'}`}>
                            {devices.map((device, index) => (
                                <div 
                                    className="text-gray-700 py-[12px] px-[16px] block cursor-pointer transition-colors duration-300 hover:bg-gray-300"
                                    key={index}
                                    onClick={() => {
                                        if (videoPreview.current) {
                                            changePreviewCam(device.deviceId, videoPreview.current, setStream);
                                        }
                                        setSelectedDeviceId(device.deviceId);
                                        setDropdownOpen(false);
                                    }}
                                >
                                    {device.label}
                                </div>
                            ))}
                        </div>
                        
                    </div>

                    <button className='bg-emerald-500 w-[100%] border-none text-white py-[12px] px-[20px] align-center
                                       inline-block text-[16px] rounded-[5px] cursor-pointer hover:bg-emerald-400 
                                       transition-colors duration-300'
                        onClick={() => changeCam(setChangeCamOverly, selectedDeviceId, localVideo, setStream, peerConnection)}
                       >Apply Changes</button>
                </div>
            </div>
        );
}