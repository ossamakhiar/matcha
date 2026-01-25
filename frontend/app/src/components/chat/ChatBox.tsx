import ChatInputField from "./ChatInputField";
import Message from "./Message";
import { useEffect, useRef, useState } from "react";
import { useMessages } from "../../context/messagesProvider";
import { useActiveDm } from "../../context/activeDmProvider";
import { monthAndDayAndTimeDateFormat } from "../../utils/dateFormatter";


const   ChatBox = () => {
    const {activeDmId} = useActiveDm();
    const chatBoxRef = useRef<HTMLDivElement>(null);
    const { messages, fetchMoreMessages, hasMore, onEventAccept, onEventDecline, onEventCancel } = useMessages();
    // ! too many boolean state which might be indicating same state?
    const [shouldScrollDown, setShouldScrollDown] = useState<boolean>(true);
    const [showScrollButton, setShowScrollButton] = useState<boolean>(false); // ? this will be true if the user viewing older messages
    const [prevScrollHeight, setPrevScrollHeight] = useState(0);
    const [moreData, setMoreData] = useState(false);


    useEffect(() => {
        if (!chatBoxRef.current)
            return ;
        if (shouldScrollDown)
            chatBoxRef.current.scrollTop = chatBoxRef.current?.scrollHeight;
        else if (moreData) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight - prevScrollHeight;
            setMoreData(false);
            setShowScrollButton(true);
        }
    }, [messages])


    const handleOnScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

        if (scrollHeight - scrollTop === clientHeight) {
            setShouldScrollDown(true);
            setShowScrollButton(false);
        } else {
            setShouldScrollDown(false);
        }
        
        if (scrollTop === 0 && hasMore) {
            fetchMoreMessages(); // ? this function should fetch more data when the user consume all the dms history
            setMoreData(true);
            setPrevScrollHeight(scrollHeight)
        }
    }

    const handleScrollButtonClick = () => {
        if (!chatBoxRef.current) return ;
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }

    return (
        <>
            <div className="h-full w-full overflow-hidden">

                {showScrollButton && 
                <div
                    onClick={handleScrollButtonClick}
                    className="w-full text-center bg-gray-200 rounded-b-lg text-sm cursor-pointer"
                >
                    you're viewing old messages
                </div>}

                <div className="h-full w-full p-2 pr-0">
                    <div ref={chatBoxRef} className="h-[calc(100%-50px)] overflow-y-auto scrollbar mr-1 pr-1.5"  onScroll={handleOnScroll}>
                        {
                            !hasMore && messages.length > 0 &&
                            <div className="w-full text-center py-2">
                                <p className="text-gray-500 text-sm italic">Beginning of the conversation</p>
                                <p className="text-gray-400 text-xs">{monthAndDayAndTimeDateFormat(messages[0].sentAt)}</p>
                            </div>
                        }
                        {
                            messages.map((message, index, arr) => {
                                return (
                                    <div
                                        key={message.sentAt} // ! add the id of the message instead of the array index
                                        className={`mr-1 my-2 md:my-2 lg:my-3 ${(index > 0 && arr[index-1].isSender != arr[index].isSender ? 'mt-3 md:mt-5 lg:mt-6' : '')} ${index == messages.length - 1 ? 'mb-3' : ''}`}
                                        >
                                        <Message
                                            key={message.messageId}
                                            message={message}
                                            onEventAccept={onEventAccept}
                                            onEventDecline={onEventDecline}
                                            onEventCancel={onEventCancel}
                                        />
                                    </div>
                                )
                            })
                        }

                    </div>
                </div>
            </div>
            <ChatInputField key={activeDmId} onSend={() => setShouldScrollDown(true)} />
        </>
    )
}



export default ChatBox;