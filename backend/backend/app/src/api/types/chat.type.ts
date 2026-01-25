import { CreateUserEvent, UserEvent } from "./event.type.js";

/**
 * Message types supported by the chat system.
 * - text: plain string
 * - audio: binary upload in, URL out
 * - event: structured event proposal
 */
export type MessageType = "text" | "audio" | "event";

/** User brief attached to outgoing socket messages */
export interface IUserBrief {
  id: number;
  firstName: string;
  lastName: string;
  profilePicture: string;
  status: "online" | "offline";
}

/**
 * Incoming payload shapes (client -> server)
 * NOTE: audio is an ArrayBuffer here because you upload raw audio bytes.
 * event content is the event proposal without creatorId (server derives creator from auth).
 */
export type EventMessageContent = Omit<CreateUserEvent, "creatorId">;

export type IncomingMessagePayload =
  | {
      to: number;
      messageType: "text";
      messageContent: string;
    }
  | {
      to: number;
      messageType: "audio";
      messageContent: ArrayBuffer;
    }
  | {
      to: number;
      messageType: "event";
      messageContent: EventMessageContent;
    };

/**
 * DB insert input (server -> DB)
 * - For text/audio, store content in dm.content
 * - For event, store dm.event_id (content is NULL)
 */
export type DmCreateInput =
  | { senderId: number; receiverId: number; messageType: "text"; content: string }
  | { senderId: number; receiverId: number; messageType: "audio"; content: string } // filename in DB
  | { senderId: number; receiverId: number; messageType: "event"; eventId: number };

/**
 * Raw DM row returned from DB helpers.
 * Represents persisted data (DB-oriented), not yet "client-ready".
 */
export type DmRow =
  | { id: number; messageType: "text"; content: string; sentAt: string }
  | { id: number; messageType: "audio"; content: string; sentAt: string } // filename
  | { id: number; messageType: "event"; eventId: number; sentAt: string };

/**
 * Client-ready DM produced by your presenter/persistMessage step (server internal).
 * - audio: content has been turned into a URL
 * - event: eventId has been expanded to a full UserEvent object
 */
export type PresentedDm =
  | { id: number; messageType: "text"; messageContent: string; sentAt: string }
  | { id: number; messageType: "audio"; messageContent: string; sentAt: string } // URL
  | { id: number; messageType: "event"; messageContent: UserEvent; sentAt: string };

/**
 * Outgoing payload (server -> client over socket)
 * This is what your UI should consume.
 */
type BaseOutgoing = {
  messageId: number;
  from: number;
  to: number;
  isSender: boolean;
  firstName: string;
  lastName: string;
  profilePicture: string;
  status: string;
  sentAt: string;
};

export type OutgoingMessagePayload =
  | (BaseOutgoing & {
      messageType: "text";
      messageContent: string;
    })
  | (BaseOutgoing & {
      messageType: "audio";
      messageContent: string; // URL
    })
  | (BaseOutgoing & {
      messageType: "event";
      messageContent: UserEvent;
    });

/** Extra socket helper type (kept from your original file) */
export interface UserEventData {
  targetUserId: number;
}
