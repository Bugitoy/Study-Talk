'use client';
import { useEffect, useRef } from 'react';

const GroupSetup = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Get camera only, no audio
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(stream => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    });
    // Cleanup: stop camera on unmount
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-4">Set up your camera</h2>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="rounded-lg shadow-lg w-full max-w-md aspect-video bg-black"
      />
      <button
        className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold text-lg shadow"
      >
        Join
      </button>
    </div>
  );
};

export default GroupSetup;

