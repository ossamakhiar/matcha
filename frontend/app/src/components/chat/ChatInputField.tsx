import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { useActiveDm } from "../../context/activeDmProvider";
import { AiOutlineAudio } from "react-icons/ai";
import { IoSend } from "react-icons/io5";
import { useSocket } from "../../context/SocketProvider";
import useRecorder from "../../hooks/useRecorder";
import { EventsEnum } from "../../types";
import { BsTrash3Fill } from "react-icons/bs";
import ChatComposerActions from "./ChatComposerActions";
import { Modal } from "../utils/Modal";
import { CreateEventForm, CreateEventPayload } from "./CreateEventForm";

enum MessageType {
    TEXT = "text",
    AUDIO = "audio",
    EVENT = "event"
}

type BaseOutgoingMessagePayload = {
    to: number;
};

type TextMessagePayload = BaseOutgoingMessagePayload & {
    type: MessageType.TEXT;
    content: string;
};

type AudioMessagePayload = BaseOutgoingMessagePayload & {
    type: MessageType.AUDIO;
    content: ArrayBuffer;
};

type EventMessagePayload = BaseOutgoingMessagePayload & {
    type: MessageType.EVENT;
    content: CreateEventPayload;
};

type OutgoingMessagePayload =
    | TextMessagePayload
    | AudioMessagePayload
    | EventMessagePayload;

function formatMinuteSecond(seconds: number) {
    return Math.floor(seconds / 60).toString().padStart(2, '0') + ':' + Math.floor(seconds % 60).toString().padStart(2, '0')
}

const   ChatInputField = ({onSend}: {onSend: () => void}) => {
    const   socket = useSocket();
    const   { activeDmId } = useActiveDm();
    const   inputRef = useRef<HTMLInputElement>(null);
    const   [isEventOpen, setIsEventOpen] = useState(false);
    const   {startRecording, stopRecording, isRecording, audioSeconds} = useRecorder();

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
        return () => {
            stopRecording();
        }
    }, [activeDmId])


    const sendMessage = (payload: OutgoingMessagePayload) => {
        let messageDetails;
    
        switch (payload.type) {
            case MessageType.TEXT:
            case MessageType.AUDIO:
                messageDetails = {
                    to: payload.to,
                    messageContent: payload.content,
                };
                break;
    
            case MessageType.EVENT:
                messageDetails = {
                    to: payload.to,
                    messageContent: payload.content,
                };
                break;
        }
    
        socket?.emit(EventsEnum.CHAT_SEND, {...messageDetails, messageType: payload.type});
    };

    const   sendHandler = (type: MessageType) => {
        if (type === MessageType.AUDIO) {
            stopRecording().then((data) =>
                sendMessage({type: MessageType.AUDIO, content: data, to: activeDmId})
            );
        } else if (type === MessageType.TEXT) {
            if (!inputRef?.current?.value) return ;
            sendMessage({type: MessageType.TEXT, content: inputRef.current.value, to: activeDmId});
            inputRef.current.value = '';
        }
        onSend();
    }

    return (
        <div className="relative pt-2">

            <div className="absolute bottom-2 w-full px-3">
                {isRecording ?
                    <div className="w-full flex items-center p-3 border rounded-lg gap-4 bg-transparent pr-20">
                        <div className="flex gap-2 items-center">
                            <button onClick={stopRecording}>
                                <BsTrash3Fill size={25} className="fill-red-500 " />
                            </button>
                            <span className="font-semibold text-sm">
                                {formatMinuteSecond(audioSeconds)}
                            </span>
                        </div>
                        <div className="flex justify-center w-full">
                        {
                            isRecording ?
                            <div className="beats-container">
                                <div className="beat"></div>
                                <div className="beat"></div>
                                <div className="beat"></div>
                                <div className="beat"></div>
                                <div className="beat"></div>
                            </div> :
                            <div className="flex justify-between w-[200px] items-center">
                                <div className="h-5 w-5 rounded-full bg-red-dark"></div>
                                <div className="h-5 w-5 rounded-full bg-red-dark"></div>
                                <div className="h-5 w-5 rounded-full bg-red-dark"></div>
                                <div className="h-5 w-5 rounded-full bg-red-dark"></div>
                                <div className="h-5 w-5 rounded-full bg-red-dark"></div>
                            </div>
                        }
                        </div>
                    </div>
                    :
                    <>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Enter your message"
                            className="outline-none border w-full p-3 px-7 pr-20 rounded-lg"
                            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && sendHandler(MessageType.TEXT)}
                        />
                        <div className="absolute bottom-0 top-0 left-3.5 flex items-center">
                            <ChatComposerActions
                                onEventClick={() => setIsEventOpen(true)}
                            />
                        </div>
                    </>
                }


                {/* right controls */}
                <div className="absolute bottom-0 top-0 right-5 flex items-center gap-2">
                    <button className={`${inputRef?.current?.value || isRecording ? 'hidden' : ''}`}>
                        <AiOutlineAudio size={25} className="fill-gray-500 hover:fill-black" onClick={startRecording} />
                    </button>
                    <button className="p-1 bg-pink rounded-md" onClick={() => sendHandler(isRecording ? MessageType.AUDIO : MessageType.TEXT)}>
                        <IoSend size={25} className="fill-white" />
                    </button>
                </div>
            </div>
        

            <Modal
                isOpen={isEventOpen}
                onClose={() => setIsEventOpen(false)}
                title="create event"
            >
                <CreateEventForm
                    onSubmit={(payload) => {
                        sendMessage({
                            type: MessageType.EVENT,
                            to: activeDmId,
                            content: payload,
                        });

                        setIsEventOpen(false);
                        onSend();
                    }}
                />
            </Modal>
        </div>
    )

}


export default ChatInputField;