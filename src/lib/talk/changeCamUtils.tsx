import openMediaStream from "./openMediaStream";

export async function getConnectedDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
}

export async function changeCam(
    setChangeCamOverly: (value: boolean) => void, 
    selectedDeviceId: string, 
    localVideo: HTMLVideoElement, 
    setStream: (stream: MediaStream) => void, 
    peerConnection: RTCPeerConnection) {
        setChangeCamOverly(false);
        if (selectedDeviceId && localVideo) {
            try {
                const stream = await openMediaStream(selectedDeviceId);
                if (stream) {
                    localVideo.srcObject = stream;
                    setStream(stream);
                    const newVideoTrack = stream.getVideoTracks()[0];
                    const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) {
                        await sender.replaceTrack(newVideoTrack);
                    }
                }
            } catch (error) {
                console.error("Error changing camera:", error);
            }
        }
    }

    export async function changePreviewCam(deviceId: string, videoPreview: HTMLVideoElement, setStream: (stream: MediaStream) => void) {
        try {
            const stream = await openMediaStream(deviceId);
            if (stream) {
                setStream(stream);
                videoPreview.srcObject = stream;
            }
        } catch (error) {
            console.error("Error changing preview camera:", error);
        }
    }