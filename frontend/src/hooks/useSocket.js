import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { connectSocket, disconnectSocket, getSocket } from "../services/socket.service";

export const useSocket = () => {
    const { authUser } = useAuth();
    const [socket, setSocket] = useState(() => getSocket());

    const userId = useMemo(() => authUser?._id || authUser?.id || null, [authUser]);

    useEffect(() => {
        if (!userId) {
            disconnectSocket();
            setSocket(null);
            return;
        }

        const socketClient = connectSocket();
        setSocket(socketClient);

        return () => {
            disconnectSocket();
            setSocket(null);
        };
    }, [userId]);

    return { socket };
};
