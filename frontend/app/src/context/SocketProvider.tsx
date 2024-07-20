import { createContext, KeyboardEvent, ReactNode, useContext, useState } from 'react';
import { io, Socket } from "socket.io-client";
// import eventObserver from '../utils/eventObserver';
// import { GlobalEventEnum } from '../types/globalEventEnum';

type Props = {
    children: ReactNode;
}

const   SocketContext = createContext<Socket | null>(null);
const   IO_SERVER_URL = "http://localhost:3000"

const   SocketProvider = ({children}: Props) => {
    const   [userId, setUserId] = useState(0);
    const   socket = io(IO_SERVER_URL, {auth: {token: userId}, withCredentials: true})

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        const input = e.target as HTMLInputElement;
        if (e.key === "Enter") {
            socket.disconnect();
            setUserId(+input.value);
        }
    }

    // // ! testing
    // socket.on('error', () => {
    //     console.log('errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');
    //     eventObserver.publish(GlobalEventEnum.ERROR_OCCURED, 'something went wrong with socket')
    // })

    return (
        <SocketContext.Provider value={socket}>
            <input className='border p-1' onKeyDown={handleKeyDown} />
            {children}
        </SocketContext.Provider>
    )
}

export const useSocket = () => useContext(SocketContext);

export default SocketProvider;