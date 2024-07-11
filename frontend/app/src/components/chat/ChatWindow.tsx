import { FC, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useSocket } from "../../context/SocketProvider";
import { sendLoggedInGetRequest } from "../../utils/httpRequests";
import { MessageProps } from "../../types";
import users from '../../data/users.json' // dummy data , previwing rendering
import dmMessages from '../../data/messages.json' // dummy data , previwing rendering
import ConversationHeader from "./ConversationHeader";
import { AiOutlineAudio } from "react-icons/ai";
import { IoSend } from "react-icons/io5";
import ChatBox from "./ChatBox";



function    getFormattedTime() {
    const   dateNow = new Date();
    const   formattedTime = `${dateNow.getHours()}:${dateNow.getMinutes()}`
    return (formattedTime)
}

const   ChatInputField: FC<{onSend: (msg: string) => void}> = ({onSend}) => {
    const   inputRef = useRef<HTMLInputElement>(null);

    const   sendHandler = () => {
        if (!inputRef.current)
            return ;

        const   msg = inputRef.current.value;
        if (msg === '') return;
        onSend(msg);
        inputRef.current.value = '';
    }

    return (
        <div className="relative pt-2">
            <div className="absolute bottom-2 w-full px-3">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Enter your message"
                    className="outline-none border w-full p-3 px-3 pr-20 rounded-lg"
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && sendHandler()}
                />

                <div className="absolute bottom-0 top-0 right-5 flex items-center gap-2">
                    <button className="">
                        <AiOutlineAudio size={25} className="fill-gray-500 hover:fill-black" />
                    </button>
                    <button className="p-1 bg-pink rounded-md" onClick={sendHandler}>
                        <IoSend size={25} className="fill-white" />
                    </button>
                </div>
            </div> 
        </div>
    )

}

const   ChatWindow: FC<{dmId: number}> = ({dmId}) => {
    const   [messages, setMessages] = useState<any[]>(dmMessages);
    // const   [participant, setParticipant] = useState<any>();
    const   socket = useSocket();  

    // const fetchData = async (url: string, cb: (data: any) => void) => {
    //     let data;
    //     try {
    //         data = await sendLoggedInGetRequest(url);
    //     } catch (e) {
    //         // ? do something with the error
    //         return ;
    //     }

    //     cb(data);
    // }

    // useEffect(() => {
    //     console.log('chat window side effect');
    //     fetchData(import.meta.env.VITE_LOCAL_CHAT_DMS, setMessages);
    //     fetchData(import.meta.env.VITE_LOCAL_CHAT_DM_PARTICIPANT, setParticipant);
    // }, [dmId]);


    const receiveMessage = (message: any) => {
        console.log(message);
        if (message.from === dmId)
            setMessages((prev) => [...prev, {isSender: false, sentAt: getFormattedTime(), message: message.message}])
    }

    const   onSendHandler = (message: string) => {
        const   sentAt = getFormattedTime();
        const   messageDetails: MessageProps = {isSender: true, message, sentAt};

        socket?.emit('chat:send', {to: dmId, message});
        console.log(message);
        setMessages((prev) => [...prev, messageDetails])
    }

    useEffect(() => {
        socket?.on('chat:message', receiveMessage)

        return () => {
            console.log("unmount ChatBox");
            socket?.removeListener('chat:message', receiveMessage)
        };
    }, [socket, dmId]) // the dmId dependency necessary for re-register the receiveMessage callback

    const dummyUser = {
        id: dmId as number,
        firstName: users[dmId - 1].firstName,
        lastName: users[dmId - 1].lastName,
        isFavorite: users[dmId - 1].isFavorite,
        status: users[dmId - 1].status as 'online' | 'offline',
        profilePicture: users[dmId - 1].profilePicture
    }

    return (
        <div className="w-full h-full flex flex-col">
            {/* normally the passed user will be the participant in user in the conversation */}
            <ConversationHeader {...dummyUser} />
            <ChatBox messages={messages} />
            <ChatInputField onSend={onSendHandler} />
        </div>
    )

}


export default ChatWindow;