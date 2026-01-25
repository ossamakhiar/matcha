export type    ChatBoxProps = {
    messages: any[];
    // shouldScrollDown: boolean;
}

export type ChatListProps = {
    // dms: MessageBarProps[];
    onClick: (id: number) => void;
}

export type PresenceType = "online" | "offline";

export type MessageKind = "text" | "audio" | "event";

export type UserType = {
    id: number,
    username?: string,
    firstName: string,
    lastName: string,
    profilePicture: string,
    status: PresenceType,
}


export type ParticipantUser = UserType & {isFavorite: boolean}

export type DmListType = ParticipantUser & {lastMessage: string, isSender: boolean, messageType: MessageKind, unreadCount: number}

export type ContactDetailsType = UserType & {biography: string}

export type MessageProps = {
    isAudio: boolean,
    isSender: boolean,
    message: string,
    sentAt: string,
}

export type EventStatus =
    | "proposed"
    | "accepted"
    | "declined"
    | "cancelled";

export type EventMessageContent = {
    title: string;
    eventDate: string;
    status?: EventStatus;
    notes?: string;
    id?: number;
    canRespond?: boolean;
};


export type MessageContent =
    | { messageType: "text"; content: string }
    | { messageType: "audio"; content: string }
    | { messageType: "event"; content: EventMessageContent };

export type MessageType = {
        messageId: number;
        isSender: boolean;
        sentAt: string;
    } & MessageContent;

export type IncomingMessagePayload =
    | {
          from: number;
          to: number;
          isSender: boolean;
          messageType: "text";
          messageContent: string;
          sentAt: string;
          profilePicture: string;
          firstName: string;
          lastName: string;
          status: PresenceType;
          isFavorite: boolean;
      }
    | {
          from: number;
          to: number;
          isSender: boolean;
          messageType: "audio";
          messageContent: string;
          sentAt: string;
          profilePicture: string;
          firstName: string;
          lastName: string;
          status: PresenceType;
          isFavorite: boolean;
      }
    | {
          from: number;
          to: number;
          isSender: boolean;
          messageType: "event";
          messageContent: EventMessageContent;
          sentAt: string;
          profilePicture: string;
          firstName: string;
          lastName: string;
          status: PresenceType;
          isFavorite: boolean;
      };