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
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Flag, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from '@/hooks/use-toast';

export default function ChatPage() {
    const { user } = useKindeBrowserClient();
    const { user: currentUser } = useCurrentUser();
    const { toast } = useToast();
    const [message, setMessage] = useState<string[]>([]);
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>(new RTCPeerConnection());
    const [ChangeCamOverly, setChangeCamOverly] = useState<boolean>(false);
    const [updateUser, setUpdateUser] = useState(0);
    const [stream, setStream] = useState<MediaStream>(new MediaStream());
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [strangerData, setStrangerData] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Report functionality
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportType, setReportType] = useState('INAPPROPRIATE_BEHAVIOR');
    
    const reportTypes = [
        { value: 'INAPPROPRIATE_BEHAVIOR', label: 'Inappropriate Behavior' },
        { value: 'HARASSMENT', label: 'Harassment' },
        { value: 'SPAM', label: 'Spam' },
        { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate Content' },
        { value: 'OTHER', label: 'Other' },
    ];
    
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

    const handleReport = async () => {
        if (!user?.id || !strangerUserId || !reportReason.trim()) {
            toast({
                title: "Error",
                description: "Please fill all fields.",
                variant: "destructive",
            });
            return;
        }
        
        try {
            const res = await fetch('/api/report/talk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    reporterId: user.id, 
                    reportedId: strangerUserId,
                    reason: reportReason, 
                    reportType 
                }),
            });
            
            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Report submitted successfully!",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to submit report.",
                    variant: "destructive",
                });
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to submit report.",
                variant: "destructive",
            });
        }
        
        setShowReportDialog(false);
        setReportReason('');
        setReportType('INAPPROPRIATE_BEHAVIOR');
    };

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
                <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2">
                            <Image
                                src="/Images/logo.svg"
                                alt="Study-Talk Logo"
                                width={50}
                                height={50}
                                className="w-8 h-8 sm:w-10 sm:h-10"
                            />
                            <span
                                className="text-lg sm:text-xl font-bold text-gray-900"
                                style={{ fontFamily: "Alata, sans-serif" }}
                            >
                                Study-Talk
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
                            <Link
                                href="/meetups"
                                className={cn(
                                    "text-base xl:text-lg font-medium transition-colors hover:text-orange-600",
                                    isActive("/meetups") ? "text-orange-600" : "text-gray-600"
                                )}
                                style={{ fontFamily: "Alata, sans-serif" }}
                            >
                                Meetups
                            </Link>
                            <Link
                                href="/pricing"
                                className={cn(
                                    "text-base xl:text-lg font-medium transition-colors hover:text-orange-600",
                                    isActive("/pricing") ? "text-orange-600" : "text-gray-600"
                                )}
                                style={{ fontFamily: "Alata, sans-serif" }}
                            >
                                Pricing
                            </Link>
                            <Link
                                href="/about"
                                className={cn(
                                    "text-base xl:text-lg font-medium transition-colors hover:text-orange-600",
                                    isActive("/about") ? "text-orange-600" : "text-gray-600"
                                )}
                                style={{ fontFamily: "Alata, sans-serif" }}
                            >
                                About
                            </Link>
                            {currentUser?.isAdmin && (
                                <Link
                                    href="/admin/reports"
                                    className={cn(
                                        "text-base xl:text-lg font-medium transition-colors hover:text-orange-600",
                                        isActive("/admin/reports") ? "text-orange-600" : "text-orange-300"
                                    )}
                                    style={{ fontFamily: "Alata, sans-serif" }}
                                >
                                    Admin
                                </Link>
                            )}
                        </nav>

                        {/* Mobile Menu Button */}
                        <div className="lg:hidden flex items-center space-x-2">
                            <Link href="/account" className="mr-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-8 h-8 rounded-full hover:bg-gray-100"
                                >
                                    <User className="w-4 h-4" />
                                    <span className="sr-only">Account</span>
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-5 h-5" />
                                ) : (
                                    <Menu className="w-5 h-5" />
                                )}
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </div>

                        {/* Desktop User Icon */}
                        <Link href="/account" className="hidden lg:block">
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
                    {isMobileMenuOpen && (
                        <nav className="lg:hidden mt-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-col space-y-3">
                                <Link
                                    href="/meetups"
                                    className={cn(
                                        "text-base font-medium transition-colors hover:text-orange-600 py-2 px-3 rounded-lg hover:bg-gray-50",
                                        isActive("/meetups") ? "text-orange-600 bg-orange-50" : "text-gray-600",
                                    )}
                                    style={{ fontFamily: "Alata, sans-serif" }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Meetups
                                </Link>
                                <Link
                                    href="/pricing"
                                    className={cn(
                                        "text-base font-medium transition-colors hover:text-orange-600 py-2 px-3 rounded-lg hover:bg-gray-50",
                                        isActive("/pricing") ? "text-orange-600 bg-orange-50" : "text-gray-600",
                                    )}
                                    style={{ fontFamily: "Alata, sans-serif" }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Pricing
                                </Link>
                                <Link
                                    href="/about"
                                    className={cn(
                                        "text-base font-medium transition-colors hover:text-orange-600 py-2 px-3 rounded-lg hover:bg-gray-50",
                                        isActive("/about") ? "text-orange-600 bg-orange-50" : "text-gray-600",
                                    )}
                                    style={{ fontFamily: "Alata, sans-serif" }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    About
                                </Link>
                                {currentUser?.isAdmin && (
                                    <Link
                                        href="/admin/reports"
                                        className={cn(
                                            "text-base font-medium transition-colors hover:text-orange-600 py-2 px-3 rounded-lg hover:bg-gray-50",
                                            isActive("/admin/reports") ? "text-orange-600 bg-orange-50" : "text-orange-300",
                                        )}
                                        style={{ fontFamily: "Alata, sans-serif" }}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Admin
                                    </Link>
                                )}
                            </div>
                        </nav>
                    )}
                </div>
            </header>

            {/* video and chat */}
            <div className='flex flex-col lg:flex-row justify-around w-full max-h-[97.1vh] p-[2px]'>
                {user === undefined || user === null ? (
                    <div>Loading...</div>
                ) : (
                    <>
                        <div id='flex flex-col w-full lg:w-[40%] max-w-[780px] max-h-[50vh] lg:max-h-[100vh] items-center pl-[1%]'>
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
                        <div className='w-full lg:w-[60%] max-w-[2000px] max-h-[50vh] lg:max-h-[100vh] flex flex-col 
                            justify-between rounded-[10px] p-[5px] sm:p-[10px] m-[1%]'>
                            <div className="flex items-center justify-between mb-2">
                                <ConnectionStatusBar strangerUsername={strangerUsername || 'Unknown'} />
                                {strangerUserId && (
                                    <button 
                                        onClick={() => setShowReportDialog(true)}
                                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-red-300 hover:bg-red-600 text-white rounded-[8px] text-xs sm:text-sm transition-colors"
                                    >
                                        <Flag className="w-3 h-3 sm:w-4 sm:h-4" />
                                        Report
                                    </button>
                                )}
                            </div>
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

            {/* Report Dialog */}
            {showReportDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md shadow-lg">
                        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Report User</h2>
                        <div className="mb-4">
                            <p className="text-xs sm:text-sm text-gray-600 mb-2">
                                Reporting: <span className="font-medium">{strangerUsername || 'Unknown User'}</span>
                            </p>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-gray-800 font-medium text-sm sm:text-base">Type of Report</label>
                            <select
                                className="w-full border border-gray-300 rounded p-2 text-black text-sm sm:text-base"
                                value={reportType}
                                onChange={e => setReportType(e.target.value)}
                            >
                                {reportTypes.map(rt => (
                                    <option key={rt.value} value={rt.value}>{rt.label}</option>
                                ))}
                            </select>
                        </div>
                        <textarea
                            className="w-full border border-gray-300 rounded p-2 mb-4 text-black text-sm sm:text-base"
                            rows={4}
                            placeholder="Describe the issue..."
                            value={reportReason}
                            onChange={e => setReportReason(e.target.value)}
                        />
                        <div className="flex flex-col sm:flex-row justify-end gap-2">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-black w-full sm:w-auto text-sm sm:text-base"
                                onClick={() => {
                                    setShowReportDialog(false);
                                    setReportReason('');
                                    setReportType('INAPPROPRIATE_BEHAVIOR');
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full sm:w-auto text-sm sm:text-base"
                                onClick={handleReport}
                                disabled={!reportReason.trim()}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


