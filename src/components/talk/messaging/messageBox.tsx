"use client"
import {useRef, useEffect} from "react";

export default function MessageBox({ message, userId, username, socket, setMessage, strangerUsername, strangerUserId, connectionStatus }
    : { 
        message: any, 
        userId: any, 
        username: any, 
        socket: any, 
        setMessage: any, 
        strangerUsername: any, 
        strangerUserId: any, 
        connectionStatus: boolean 
    }) {

        const scrollMessageDiv = useRef<HTMLDivElement>(null)

        useEffect(() => {
            if (scrollMessageDiv.current) {
                scrollMessageDiv.current.scrollIntoView({behavior: "smooth", block: "start" });
            }
        }, [message])

        useEffect(() => {
            if (socket) {
                socket.on("private message", ({ content, from }: { content: any, from: any }) => {
                    if (strangerUserId === from) {
                        setMessage((prevMessages: any) => [...prevMessages, content]);
                    }
                })

                return () => {
                    socket.removeAllListeners("private message");
                }
            }
        }, [strangerUserId])

        return (
            <div className='grow overflow-y-auto p-[10px] bg-slate-400 rounded-[10px] mb-[10px]
                            max-w-[100%] relative flex flex-col'>
                {(connectionStatus !== null && message.length === 0) && (
                    <div className='absolute top-0 left-0 w-[100%] h-[100%] bg-slate-400 
                                    text-white flex items-center justify-center rounded-[10px] z-1'>
                        {connectionStatus ? (
                            <p>{username} is connected with {strangerUsername}</p>
                        ) : (
                            <p>Looking for stranger...</p>
                        )}
                    </div>
                )}
                {message.map((item:any, index:number) => (
                    item ? (
                        <div className={item.userId === userId ? 
                        'text-[1em] p-[10px] mb-[1%] w-fit max-w-[75%] break-words whitespace-normal text-white bg-blue-300 self-end rounded-tl-[10px] rounded-tr-[10px] rounded-br-none rounded-bl-[10px]' : 
                        'text-[1em] p-[10px] mb-[1%] w-fit max-w-[75%] break-words whitespace-normal text-white bg-thanodi-peach self-start rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-none'} 
                        key={index}>
                            {item.message}
                        </div>
                    ) : null
                ))}
                <div ref={scrollMessageDiv}></div>
            </div>
        )
    }
