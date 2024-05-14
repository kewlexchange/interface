import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {io, Socket} from "socket.io-client";
import { SOCKET_END_POINT_URL } from '../constants/ai';
interface SocketContextProps {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextProps>({ socket: null });

interface SocketProviderProps {
    children: ReactNode;
}

export function useSocket() {
    return useContext(SocketContext);
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const newSocket = io(SOCKET_END_POINT_URL, {
            autoConnect: true,
            secure: true,
            forceNew: true,
            reconnection: true,
            transports: ['websocket','polling']
        });

        newSocket.on('connect', () => {
            console.log("socket ON connect");
        });
        newSocket.on('message', (data) => {
            console.log("message",data);
        });
        newSocket.on('chat', (data) => {
            console.log("chat_kanali",data);
        });
        newSocket.on('ai', (data) => {
            console.log("ai_kanali",data);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};