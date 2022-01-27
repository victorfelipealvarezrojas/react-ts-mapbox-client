import { useEffect, useMemo, useState } from 'react';
import io from 'socket.io-client';


export const useSocket = (serverPath: any) => {
    /********************************************************
        Nota:   Utilizo use memo para asegurarme de que no 
                realice una nueva conexion al socket server
                si el valor del patch sigue sindop el mismo
    *********************************************************/
    const socket = useMemo(() => io(serverPath, {
        transports: ['websocket']
    }), [serverPath]);

    //identificar si se conecto o no
    const [online, setOnline] = useState(false);

    useEffect(() => {
        setOnline(socket.connected);
    }, [socket])

    useEffect(() => {
        socket.on('connect', () => setOnline(true));
    }, [socket])

    useEffect(() => {
        socket.on('disconnect', () => setOnline(false));
    }, [socket])

    return {
        socket,
        online
    }
}
