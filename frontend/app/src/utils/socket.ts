import { Socket } from "socket.io-client";
import { DmListType } from "../types";

type    EventHandlerType = [event: string, (data: any) => void];

export function    prepareSocketEventRegistration(eventHandlers : EventHandlerType[]) {
    return (socket: Socket) => {
        console.log(socket);

        eventHandlers.forEach(([event, handler]) => {
            socket.on(event, handler);
        })

        return () => {
            eventHandlers.forEach(([event, handler]) => {
                socket.removeListener(event, handler);
            })
        }
    }
} 


export function changeParticipantPresence(data: DmListType[], onlineUser: number[]) {
    const onlineUserSet = new Set(onlineUser);

    const ret: DmListType[] = data.map(element => {
        const isOnline = onlineUserSet.has(element.id);
        const status = isOnline ? 'online' : 'offline';
        return element.status === status ? element : {...element, status};
    });

    return (ret);
}
