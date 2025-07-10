"use client";
import { useState, useRef } from 'react';
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import usePeerConnection from '@/hooks/talk/usePeerConnection';
import LiveChat from '@/hooks/talk/LiveChat';
import LocalVideo from '@/components/talk/videoCall/localVideo';
import RemoteVideo from '@/components/talk/videoCall/remoteVideo';
import MessageBox from '@/components/talk/messaging/messageBox';
import InputBox from '@/components/talk/messaging/inputBox';
import ConnectionStatusBar from '@/components/talk/messaging/connectionStatusBar';
import startWebRtcNegotiation from '@/lib/talk/startWebRtcNegotiation';
import ChangeLocalMediaStream from '@/components/talk/videoCall/changeCam';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
    const { user } = useKindeBrowserClient();
    const [message, setMessage] = useState<string[]>([]);
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>(new RTCPeerConnection());
    const [ChangeCamOverly, setChangeCamOverly] = useState<boolean>(false);
    const [updateUser, setUpdateUser] = useState(0);
    const [stream, setStream] = useState<MediaStream>(new MediaStream());
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [strangerData, setStrangerData] = useState(null);
    
    const localVideo = useRef<HTMLVideoElement | null>(null);
    const remoteVideo = useRef<HTMLVideoElement | null>(null);

    const username = user?.given_name;
    const userId = user?.id;

    const { socket, strangerUserId, strangerUsername, connectionStatus } = LiveChat(
        remoteVideo,
        setMessage,
        updateUser,
        peerConnection,
        setPeerConnection,
        setStrangerData
    );

    usePeerConnection(setPeerConnection);

    if (stream) {
        startWebRtcNegotiation(socket, strangerData, peerConnection, stream);
    }

    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <div className='pb-[1%]'
            style={{
                backgroundImage:
                "linear-gradient(to bottom right, #FFECD2, #DCEAF7, #FFDECA)",
            }}>
                
            {/* navbar */}
            <header className="border-2 border-gray-300 bg-white/80 backdrop-blur-sm mb-[1%]">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{
                                    backgroundImage:
                                        "linear-gradient(to bottom right, #F7D379, #F9B288)",
                                }}
                            >
                                <span className="text-white font-bold text-lg">T</span>
                            </div>
                            <span
                                className="text-xl font-bold text-gray-900"
                                style={{ fontFamily: "Alata, sans-serif" }}
                            >
                                Thanodi
                            </span>
                        </Link>

                        {/* Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <Link
                                href="/meetups"
                                className={cn(
                                    "text-lg font-medium transition-colors hover:text-orange-600",
                                    isActive("/meetups") ? "text-orange-600" : "text-gray-600"
                                )}
                                style={{ fontFamily: "Alata, sans-serif" }}
                            >
                                Meetups
                            </Link>
                            <Link
                                href="/dictionary"
                                className={cn(
                                    "text-lg font-medium transition-colors hover:text-orange-600",
                                    isActive("/dictionary") ? "text-orange-600" : "text-gray-600"
                                )}
                                style={{ fontFamily: "Alata, sans-serif" }}
                            >
                                Dictionary
                            </Link>
                            <Link
                                href="/pricing"
                                className={cn(
                                    "text-lg font-medium transition-colors hover:text-orange-600",
                                    isActive("/pricing") ? "text-orange-600" : "text-gray-600"
                                )}
                                style={{ fontFamily: "Alata, sans-serif" }}
                            >
                                Pricing
                            </Link>
                            <Link
                                href="/about"
                                className={cn(
                                    "text-lg font-medium transition-colors hover:text-orange-600",
                                    isActive("/about") ? "text-orange-600" : "text-gray-600"
                                )}
                                style={{ fontFamily: "Alata, sans-serif" }}
                            >
                                About
                            </Link>
                        </nav>

                        {/* User Icon */}
                        <Link href="/account">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-10 h-10 rounded-full hover:bg-gray-100"
                            >
                                <User className="w-5 h-5" />
                                <span className="sr-only">Account</span>
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Navigation */}
                    <nav className="md:hidden flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-200">
                        <Link
                            href="/dictionary"
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-orange-600",
                                isActive("/dictionary") ? "text-orange-600" : "text-gray-600"
                            )}
                            style={{ fontFamily: "Alata, sans-serif" }}
                        >
                            Dictionary
                        </Link>
                        <Link
                            href="/pricing"
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-orange-600",
                                isActive("/pricing") ? "text-orange-600" : "text-gray-600"
                            )}
                            style={{ fontFamily: "Alata, sans-serif" }}
                        >
                            Pricing
                        </Link>
                        <Link
                            href="/about"
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-orange-600",
                                isActive("/about") ? "text-orange-600" : "text-gray-600"
                            )}
                            style={{ fontFamily: "Alata, sans-serif" }}
                        >
                            About
                        </Link>
                    </nav>
                </div>
            </header>

            {/* video and chat */}
            <div className='flex justify-around w-full max-h-[97.1vh] p-[2px]'>
                {user === undefined || user === null ? (
                    <div>Loading...</div>
                ) : (
                    <>
                        <div id='flex flex-col w-[40%] max-w-[780px] max-h-[100vh] items-center pl-[1%]'>
                            <ChangeLocalMediaStream
                                peerConnection={peerConnection}
                                localVideo={localVideo.current!}
                                ChangeCamOverly={ChangeCamOverly}
                                setChangeCamOverly={setChangeCamOverly}
                                selectedDeviceId={selectedDeviceId || ''}
                                setSelectedDeviceId={setSelectedDeviceId}
                                setStream={setStream}
                            />
                            <LocalVideo
                                localVideo={localVideo}
                                peerConnection={peerConnection}
                                setChangeCamOverly={setChangeCamOverly}
                                setStream={setStream}
                                stream={stream}
                                selectedDeviceId={selectedDeviceId || ''}
                            />
                            <RemoteVideo
                                remoteVideo={remoteVideo}
                                peerConnection={peerConnection}
                                setChangeCamOverly={setChangeCamOverly}
                            />
                        </div>
                        <div className='w-[60%] max-w-[2000px] max-h-[100vh] flex flex-col 
                            justify-between rounded-[10px] p-[10px] m-[1%]'>
                            <ConnectionStatusBar strangerUsername={strangerUsername || 'Unknown'} />
                            <MessageBox
                                message={message}
                                username={username}
                                userId={userId}
                                socket={socket}
                                setMessage={setMessage}
                                strangerUsername={strangerUsername}
                                strangerUserId={strangerUserId}
                                connectionStatus={connectionStatus}
                            />
                            <InputBox
                                socket={socket}
                                setMessage={setMessage}
                                setUpdateUser={setUpdateUser}
                                strangerUserId={strangerUserId}
                                username={username}
                                userId={userId}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}


