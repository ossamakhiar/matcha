export type    ChatBoxProps = {
    messages: any[];
    // shouldScrollDown: boolean;
}

export type ChatListProps = {
    // dms: MessageBarProps[];
    onClick: (id: number) => void;
}

export type    PresenceType = 'online' | 'offline';

export type UserType = {
    id: number,
    username?: string,
    firstName: string,
    lastName: string,
    profilePicture: string,
    status: PresenceType,
}

export type ParticipantUser = UserType & {isFavorite: boolean}

export type DmListType = ParticipantUser & {lastMessage: string, unreadCount: number}

export type ContactDetailsType = UserType & {biography: string}

export type MessageProps = {
    isSender: boolean,
    message: string,
    sentAt: string,
}

type MessageTypes = 'audio' | 'text';

export type MessageType = {
    isSender: boolean;
    from: number;
    messageType: MessageTypes;
    messageContent: string | ArrayBuffer;
    sentAt: string;
}


export enum    EventsEnum {
    CHAT_SEND = 'chat:send',
    CHAT_RECEIVE = 'chat:message',
    GLOBAL_PRESENCE = 'global:online-users',
    APP_FAVORITE_CHANGE = 'app:favorite',
    APP_SEND_MESSAGE = 'app:send',
}


// export type ChatListStateType = {
//     dms: DmListType[],
//     contacts: DmListType[],
//     searchInput: string,
//     currentTab: string,
// }