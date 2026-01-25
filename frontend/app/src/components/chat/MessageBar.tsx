import { DmListType, MessageKind } from "../../types";

// Dm bar
function formatMessage(messageType: MessageKind, message: string, isSender: boolean) {
    let displayedMessage = message; 
    if (messageType === "event")
        return `📅 event proposal`;

    if (messageType === "audio") 
        return "🎤 Voice message";

    return `${isSender ? 'You: ' : ''}${displayedMessage}`;
}

const   MessageBar = (props: DmListType) => {
    return (
        <div className="w-full p-1 h-20 flex items-center gap-2  hover:bg-gray-200 cursor-pointer">
            <div className="relative">
                <span
                    className={`${props.status === 'online' ? "bg-green-500" : "bg-red-600"} absolute right-0 flex items-center justify-center w-[16px] h-[16px] font-semibold text-white rounded-full text-xs`}
                >
                        {props.unreadCount !== 0 ? props.unreadCount : ""}
                </span>

                <img
                src={props.profilePicture}
                alt="Profile"
                className={`min-w-[60px] max-w-[60px] min-h-[60px] max-h-[60px] rounded-full object-cover ${props.status === 'online' ? 'bg-green-500' : 'bg-gray-500' }`} />
            </div>
            <div className="flex flex-col overflow-hidden">
                <h1 className="text-lg truncate">
                    {`${props.firstName} ${props.lastName}`}
                </h1>
                {
                    props.lastMessage !== undefined &&
                    <p className="text-gray-500 truncate text-sm">
                        {formatMessage(props.messageType, props.lastMessage, props.isSender)}
                    </p>
                }
            </div>
        </div>
    )
}


export default MessageBar;