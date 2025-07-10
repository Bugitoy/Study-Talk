"use client"
import { useState } from "react";
export default function InputBox(
    { socket, 
      setMessage, 
      strangerUserId, 
      username, 
      setUpdateUser, 
      userId
    }: 
    { socket: any, 
      setMessage: any, 
      strangerUserId: any, 
      username: any, 
      setUpdateUser: any, 
      userId : any }) {
        
    const [messageInputValue, setMessageInputValue] = useState("");
    
    function sendMessage(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (socket) {
            socket.emit("private message", {
                content: {
                    username: username,
                    message: messageInputValue,
                    userid: socket.id
                },
                to: strangerUserId
            });

            setMessage((prevMessages: any) => [...prevMessages, {
                username: username,
                message: messageInputValue,
                userId: userId // Include userId in local state
            }]);
            setMessageInputValue("");
        } else {
            console.log("Socket is not connected.");
        }
    }

    function getNewUser(e: React.MouseEvent<HTMLInputElement>){
        e.preventDefault()
        setUpdateUser((prev: any) => prev + 1)
    }

    return (
        <div className='items-center justify-center'>
            <form onSubmit={sendMessage} className='flex w-[100%]'>
                <input type="button" value="new" 
                    className='py-[1%] px-[2%] bg-thanodi-peach border-none rounded-[5px] 
                               w-fit text-white cursor-pointer hover:bg-orange-200 items-center
                               justify-center w-[10vh] float-left items-center'            
                    onClick={getNewUser}/>
                <input 
                    type="text"
                    name="sendMessage"
                    className='grow p-[10px] rounded-[5px] border-none bg-slate-300 text-gray
                                mr-[10px] ml-[10px] w-[100%]'
                    value={messageInputValue}
                    onChange={(e) => setMessageInputValue(e.target.value)}/>
                <input type="submit" value="send" 
                    className='py-[1%] px-[2%] bg-emerald-500 border-none
                               rounded-[5px] w-fit text-white cursor-pointer hover:bg-emerald-400
                               items-center justify-center'/>
            </form>
        </div>
    )
}