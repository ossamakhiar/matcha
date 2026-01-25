export enum    EventsEnum {
    // received events
    GLOBAL_PRESENCE = 'global:online-users',
    CHAT_RECEIVE = 'chat:message',
    EVENT_STATUS_UPDATE = 'event:statusUpdate',

    // sended events
    CHAT_SEND = 'chat:send',
    EVENT_RESPOND = 'event:respond',
    NOTIFICATION_LIKE = 'notification:like',
    NOTIFICATION_UNLIKE = 'notification:unlike',
    NOTIFICATION_VISIT = 'notification:visit',
    
    // application events (pulisher-observer pattern)
    APP_FAVORITE_CHANGE = 'app:favorite',
    // APP_SEND_MESSAGE = 'app:send',
    APP_BLOCK_CHAT_UNLIKE='app:block-unlike-chat'
}