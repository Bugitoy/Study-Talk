import { useEffect, useRef } from "react";
import webrtcSignaling from "./webrtc-signaling";

// heavily  dependent on localVideo.jsx look at it first, and SocketProvider(stranger data).

// Define a type for the signaling object
type SignalingType = {
    sendOffer: () => Promise<void>;
    sendCandidate: ({ candidate }: { candidate: any }) => void;
    handleNegotiation: (m: any) => Promise<void>;
};

export default function startWebRtcNegotiation(
  socket: any,
  strangerdata: any,
  pc: RTCPeerConnection,
  stream: MediaStream,
) {
  const signalingRef = useRef<SignalingType | null>(null);
  const sendersRef = useRef<RTCRtpSender[]>([]); // 👈 track senders manually

  useEffect(() => {
    if (strangerdata) {
      signalingRef.current = webrtcSignaling(socket, pc, strangerdata);
      const { sendOffer, sendCandidate, handleNegotiation } = signalingRef.current;
      console.log("current strangerdata", strangerdata);

      try {
        for (const track of stream.getTracks()) {
          const sender = pc.addTrack(track, stream);
          sendersRef.current.push(sender); // 👈 store sender
        }

        pc.onnegotiationneeded = sendOffer;
        pc.onicecandidate = sendCandidate;
        socket.on('message', handleNegotiation);
      } catch (err) {
        console.error(err);
      }

      return () => {
        // ✅ Use saved senders for cleanup
        if (pc.signalingState !== 'closed') {
          sendersRef.current.forEach(sender => {
            try {
              if (sender) pc.removeTrack(sender);
            } catch (err) {
              console.warn("⚠️ Failed to remove sender:", err);
            }
          });
        }

        socket.removeAllListeners('message');
        sendersRef.current = []; // clear it
      };
    }
  }, [stream, strangerdata]);
}
