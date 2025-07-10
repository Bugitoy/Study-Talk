export default function webrtcSignaling(
    socket: any,
    pc: RTCPeerConnection,
    strangerdata: any ) {
        let makingOffer: boolean;
        let ignoreOffer: boolean;
        const polite = strangerdata['polite']
        const strangerId = strangerdata['pairedUserId']

        console.log(strangerId, "strangerId");

        async function sendOffer() {
            try {
                makingOffer = true;
                await pc.setLocalDescription()
                socket.emit('message', {description: pc.localDescription, to: strangerId })
                console.log("sent offer", strangerdata['strangerUsername']);
            } catch (err) {
                console.error(err);
            } finally {
                makingOffer = false;
            }
        }

        function sendCandidate({ candidate }: { candidate: any }) {
            socket.emit('message', { candidate, to: strangerId })
        }

        async function handleNegotiation(m: any) {
            if (m === undefined) return
            console.log('running');
            if (pc.signalingState === 'closed') return
            const [description, candidate] = [m['description'], m['candidate']]
            try {
                if (description) {
                    const offerCollision = description.type === 'offer' &&
                    (makingOffer || pc.signalingState !== "stable");
                    
                     ignoreOffer = !polite && offerCollision;
                     if (ignoreOffer) {
                        return;
                     }
                     await pc.setRemoteDescription(description);
                     console.log("recieved offer/answer", strangerdata['strangerUsername']);
                     if (description.type === "offer") {
                        await pc.setLocalDescription();
                        socket.emit('message', { description: pc.localDescription, to: strangerId })
                     }
                } else if (candidate) {
                    try {
                        await pc.addIceCandidate(candidate);
                    } catch (err) {
                        if (!ignoreOffer) {
                            throw err;
                        }
                    }
                }                
            } catch (err) {
                console.error(err);
            }
        }

        return { sendOffer, sendCandidate, handleNegotiation }

}