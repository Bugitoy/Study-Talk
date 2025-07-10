"use client";

import {useEffect} from "react";
import setPcInstance from "@/lib/talk/pcInstance";

export default function usePeerConnection(setPeerConnection: (pc: RTCPeerConnection) => void) {
    useEffect(() => {
        const pcInstance = setPcInstance();
        setPeerConnection(pcInstance)
    }, [])
}