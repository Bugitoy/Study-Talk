export default async function openMediaStream(cameraId: string){
    const constraints = {
        'video': {
            ...(cameraId ? { deviceId: { exact: cameraId } } : {}),
            width: {max: 1920 },
            height: {max: 1080}
        },
        'audio': {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
        }
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints as MediaStreamConstraints);
        return stream;
    } catch (error) {
        console.error("Error opening media stream:", error);
    }
}