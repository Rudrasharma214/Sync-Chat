import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosIN } from "../lib/axios";
import { useAuthStore } from "./useAuthStore"; // Ensure this import is correct for accessing the socket

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosIN.get("/chat/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosIN.get(`/chat/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosIN.post(`/chat/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  // New: Delete message for the current user only (client-side)
  deleteMessageForMe: (messageId) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg._id !== messageId),
    }));
    // toast.success("Message deleted for you.");
  },

  // New: Delete message for everyone (requires backend API)
  deleteMessageForEveryone: async (messageId) => {
    try {
      await axiosIN.delete(`/chat/messages/${messageId}`); 
      
      // If successful, update the local state to remove the message
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
      // toast.success("Message deleted for everyone.");

      
      const socket = useAuthStore.getState().socket;
      if (socket) {
        
        const messageToDelete = get().messages.find(msg => msg._id === messageId);
        if (messageToDelete) {
          socket.emit("messageDeleted", {
            messageId: messageToDelete._id,
            senderId: messageToDelete.senderId,
            receiverId: messageToDelete.receiverId
          });
        }
      }

    } catch (error) {
      console.error("Error deleting message for everyone:", error);
      toast.error(error.response?.data?.message || "Failed to delete message for everyone.");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) { 
        console.warn("Socket not available for message subscription.");
        return;
    }

    socket.on("newMessage", (newMessage) => {
      // Check if the new message is for the currently selected chat
      // This means the sender of the new message is the selectedUser, and the receiver is me (authUser)
      const authUserId = useAuthStore.getState().authUser?._id;
      const isMessageForCurrentChat = 
        (newMessage.senderId === selectedUser._id && newMessage.receiverId === authUserId) ||
        (newMessage.receiverId === selectedUser._id && newMessage.senderId === authUserId);

      if (isMessageForCurrentChat) {
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      }
    });

    // IMPORTANT CHANGE HERE: Handle message deletion events from other users via socket
    // The backend emits { messageId, senderId, receiverId }
    socket.on("messageDeleted", ({ messageId, senderId, receiverId }) => {
        const currentSelectedUserId = get().selectedUser?._id;
        const authUserId = useAuthStore.getState().authUser?._id;

        // Check if the deleted message belongs to the currently selected conversation
        // This means the selected user is either the sender or the receiver of the deleted message,
        // and the current authenticated user is the other participant.
        const isMessageInCurrentChat = 
            (currentSelectedUserId === senderId && authUserId === receiverId) || // Selected user sent it to me
            (currentSelectedUserId === receiverId && authUserId === senderId);   // Selected user received it from me (i.e., I sent it to them)

        if (isMessageInCurrentChat) {
            set((state) => ({
                messages: state.messages.filter((msg) => msg._id !== messageId),
            }));
            toast.info("A message was deleted."); // Inform the user
        }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) { 
        socket.off("newMessage");
        socket.off("messageDeleted"); // Unsubscribe from the new event
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));



// import { create } from "zustand";
// import toast from "react-hot-toast";
// import { axiosIN } from "../lib/axios";
// import { useAuthStore } from "./useAuthStore";

// export const useChatStore = create((set, get) => ({
//   messages: [],
//   users: [],
//   selectedUser: null,
//   isUsersLoading: false,
//   isMessagesLoading: false,

//   getUsers: async () => {
//     set({ isUsersLoading: true });
//     try {
//       const res = await axiosIN.get("/chat/users");
//       set({ users: res.data });
//     } catch (error) {
//       toast.error(error.response.data.message);
//     } finally {
//       set({ isUsersLoading: false });
//     }
//   },

//   getMessages: async (userId) => {
//     set({ isMessagesLoading: true });
//     try {
//       const res = await axiosIN.get(`/chat/${userId}`);
//       set({ messages: res.data });
//     } catch (error) {
//       toast.error(error.response.data.message);
//     } finally {
//       set({ isMessagesLoading: false });
//     }
//   },
//   sendMessage: async (messageData) => {
//     const { selectedUser, messages } = get();
//     try {
//       const res = await axiosIN.post(`/chat/send/${selectedUser._id}`, messageData);
//       set({ messages: [...messages, res.data] });
//     } catch (error) {
//       toast.error(error.response.data.message);
//     }
//   },

//   subscribeToMessages: () => {
//     const { selectedUser } = get();
//     if (!selectedUser) return;

//     const socket = useAuthStore.getState().socket;

//     socket.on("newMessage", (newMessage) => {
//       const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
//       if (!isMessageSentFromSelectedUser) return;

//       set({
//         messages: [...get().messages, newMessage],
//       });
//     });
//   },

//   unsubscribeFromMessages: () => {
//     const socket = useAuthStore.getState().socket;
//     socket.off("newMessage");
//   },

//   setSelectedUser: (selectedUser) => set({ selectedUser }),
// }));