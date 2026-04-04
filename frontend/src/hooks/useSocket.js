import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { connectSocket, disconnectSocket, getSocket } from "../services/socket.service";

const getAuthToken = (authUser) => {
    return authUser?.accessToken || authUser?.token || authUser?.jwt || null;
};

export const useSocket = () => {
    const { authUser } = useAuth();
    const [socket, setSocket] = useState(() => getSocket());

    const userId = useMemo(() => authUser?._id || authUser?.id || null, [authUser]);
    const token = useMemo(() => getAuthToken(authUser), [authUser]);

    useEffect(() => {
        if (!userId) {
            disconnectSocket();
            setSocket(null);
            return;
        }

        const socketClient = connectSocket(token);
        setSocket(socketClient);

        return () => {
            disconnectSocket();
            setSocket(null);
        };
    }, [userId, token]);

    return { socket };
};
