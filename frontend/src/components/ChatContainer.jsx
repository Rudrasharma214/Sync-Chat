import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react"; // Import useState for showOptions

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils"; // Keep formatMessageTime
import { MoreVertical, Trash2 } from 'lucide-react'; // Import icons for delete options
import toast from 'react-hot-toast'; // Import toast for confirmation (if not using window.confirm)

// Accept onBack prop from HomePage to pass to ChatHeader
const ChatContainer = ({ onBack }) => { 
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessageForMe, // <--- Import delete functions
    deleteMessageForEveryone, // <--- Import delete functions
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);

  // State to manage which message's options are currently open
  const [openMessageOptionsId, setOpenMessageOptionsId] = useState(null);
  const touchTimeoutRef = useRef(null); // Ref for long press timer
  const LONG_PRESS_THRESHOLD = 500; // milliseconds for long press

  // Ref for the currently open options menu to handle clicks outside
  const optionsMenuRef = useRef(null);

  // Effect to handle clicks outside the options menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If an options menu is open and the click is outside of it, close it
      if (openMessageOptionsId && optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
        setOpenMessageOptionsId(null);
      }
    };

    // Add event listener when options are shown
    if (openMessageOptionsId) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      // Remove event listener when options are hidden
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup function to remove event listener on component unmount or openMessageOptionsId change
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMessageOptionsId]);


  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [
    selectedUser?._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      // Added 'h-full' to ensure the flex container explicitly takes full height
      <div className="flex-1 flex flex-col h-full"> 
        <ChatHeader onBack={onBack} /> {/* Pass onBack prop */}
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  if (!selectedUser) {
    return (
      // Added 'h-full' to ensure the flex container explicitly takes full height
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4 h-full">
        <p className="text-xl text-base-content/70">Select a chat to start messaging</p>
        <p className="text-sm text-base-content/50 mt-2">
          Use the search bar on the left to find users.
        </p>
      </div>
    );
  }

  // Function to handle deleting the message only for the current user
  const handleDeleteForMe = (messageId) => {
    deleteMessageForMe(messageId);
    setOpenMessageOptionsId(null); // Close the options dropdown
  };

  // Function to handle deleting the message for all participants
  const handleDeleteForEveryone = async (messageId) => {
    // Using toast for confirmation as per instructions
    toast((t) => (
      <div className="flex flex-col items-center p-2">
        <p className="text-sm font-semibold">Are you sure you want to delete this message for everyone?</p>
        <p className="text-xs text-gray-500 mb-2">This action cannot be undone.</p>
        <div className="flex gap-2">
          <button 
            className="btn btn-sm btn-error" 
            onClick={async () => {
              await deleteMessageForEveryone(messageId);
              setOpenMessageOptionsId(null);
              toast.dismiss(t.id);
            }}
          >
            Delete
          </button>
          <button 
            className="btn btn-sm btn-ghost" 
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: Infinity, // Keep toast open until user interacts
      position: 'top-center',
      style: {
        background: 'var(--fallback-b1,oklch(var(--b1)/1))',
        color: 'var(--fallback-bc,oklch(var(--bc)/1))',
        borderRadius: '0.5rem',
        border: '1px solid var(--fallback-b3,oklch(var(--b3)/1))',
      },
      ariaProps: {
        role: 'status',
        'aria-live': 'polite',
      },
    });
  };

  // Handles double-click event on the chat bubble
  const handleDoubleClick = (messageId, isMyMessage) => {
    if (isMyMessage) { // Only allow double-click for my own messages
      setOpenMessageOptionsId(openMessageOptionsId === messageId ? null : messageId);
    }
  };

  // Handles touch start event for long press detection
  const handleTouchStart = (messageId, isMyMessage) => {
    if (isMyMessage) { // Only allow long press for my own messages
      // Start a timer. If touchEnd doesn't happen before threshold, it's a long press
      touchTimeoutRef.current = setTimeout(() => {
        setOpenMessageOptionsId(messageId); // Show options on long press
      }, LONG_PRESS_THRESHOLD);
    }
  };

  // Handles touch end event for long press detection
  const handleTouchEnd = () => {
    clearTimeout(touchTimeoutRef.current); // Clear the timer if touch ends quickly (it's a tap)
  };


  return (
    // This container is a flex column. Its children will stack vertically.
    // The 'flex-1' makes it fill the available height from its parent (HomePage).
    // Added 'h-full' to explicitly ensure it takes 100% of its parent's height.
    <div className="flex-1 flex flex-col h-full"> 
      <ChatHeader onBack={onBack} /> {/* Pass onBack prop */}

      {/* This div uses 'flex-1' to take up all remaining vertical space,
          pushing the MessageInput to the bottom. This is where the scrolling happens. */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-zinc-500 py-4">
            Say hi to {selectedUser.fullname}! No messages yet.
          </div>
        )}
        {messages.map((message) => {
          const isMyMessage = message.senderId === authUser._id;
          const senderProfilePic = isMyMessage
            ? authUser.profilepic || "/avatar.png"
            : selectedUser.profilepic || "/avatar.png";

          return (
            <div
              key={message._id}
              className={`chat ${isMyMessage ? "chat-end" : "chat-start"} relative`}
              // Add event handlers directly to the chat bubble div
              onDoubleClick={() => handleDoubleClick(message._id, isMyMessage)}
              onTouchStart={() => handleTouchStart(message._id, isMyMessage)}
              onTouchEnd={handleTouchEnd}
            >
              <div className=" chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={senderProfilePic}
                    alt="profile pic"
                    onError={(e) => { e.target.onerror = null; e.target.src = "/avatar.png"; }} // Fallback for broken images
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className="chat-bubble flex flex-col relative bg-base-200 text-base-content rounded-lg p-3 max-w-xs break-words">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2 object-cover"
                  />
                )}
                {message.text && <p>{message.text}</p>}

                {/* Message options button and dropdown */}
                {isMyMessage && (
                  // Adjusted the positioning for a better gap
                  <div className="absolute top-0 right-0 transform translate-x-4 mt-1"> 
                    <button
                      className="btn btn-ghost btn-xs rounded-full p-1"
                      onClick={() => setOpenMessageOptionsId(openMessageOptionsId === message._id ? null : message._id)}
                      aria-label="Message options"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {/* Dropdown menu for message options */}
                    {openMessageOptionsId === message._id && (
                      <ul ref={optionsMenuRef} className="menu bg-base-100 rounded-box shadow-lg absolute right-0 mt-2 z-10 w-40">
                        <li>
                          <button onClick={() => handleDeleteForMe(message._id)} className="flex items-center text-error hover:bg-base-200 rounded-md p-2">
                            <Trash2 size={16} className="mr-2" /> Delete for me
                          </button>
                        </li>
                        <li>
                          <button onClick={() => handleDeleteForEveryone(message._id)} className="flex items-center text-error hover:bg-base-200 rounded-md p-2">
                            <Trash2 size={16} className="mr-2" /> Delete for everyone
                          </button>
                        </li>
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* MessageInput is a direct child of the flex column, so it will be pushed to the bottom */}
      <MessageInput />
    </div>
  );
};

export default ChatContainer;




// import { useChatStore } from "../store/useChatStore";
// import { useEffect, useRef } from "react";

// import ChatHeader from "./ChatHeader";
// import MessageInput from "./MessageInput";
// import MessageSkeleton from "./skeletons/MessageSkeleton";
// import { useAuthStore } from "../store/useAuthStore";
// import { formatMessageTime } from "../lib/utils";

// const ChatContainer = () => {
//   const {
//     messages,
//     getMessages,
//     isMessagesLoading,
//     selectedUser,
//     subscribeToMessages,
//     unsubscribeFromMessages,
//   } = useChatStore();
//   const { authUser } = useAuthStore();
//   const messageEndRef = useRef(null);

//   useEffect(() => {
//     getMessages(selectedUser._id);

//     subscribeToMessages();

//     return () => unsubscribeFromMessages();
//   }, [
//     selectedUser._id,
//     getMessages,
//     subscribeToMessages,
//     unsubscribeFromMessages,
//   ]);

//   useEffect(() => {
//     if (messageEndRef.current && messages) {
//       messageEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   if (isMessagesLoading) {
//     return (
//       <div className="flex-1 flex flex-col overflow-auto">
//         <ChatHeader />
//         <MessageSkeleton />
//         <MessageInput />
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 flex flex-col overflow-auto">
//       <ChatHeader />

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((message) => (
//           <div
//             key={message._id}
//             className={`chat ${
//               message.senderId === authUser._id ? "chat-end" : "chat-start"
//             }`}
//             ref={messageEndRef}
//           >
//             <div className=" chat-image avatar">
//               <div className="size-10 rounded-full border">
//                 <img
//                   src={
//                     message.senderId === authUser._id
//                       ? authUser.profilepic || "/avatar.png"
//                       : selectedUser.profilepic || "/avatar.png"
//                   }
//                   alt="profile pic"
//                 />
//               </div>
//             </div>
//             <div className="chat-header mb-1">
//               <time className="text-xs opacity-50 ml-1">
//                 {formatMessageTime(message.createdAt)}
//               </time>
//             </div>
//             <div className="chat-bubble flex flex-col">
//               {message.image && (
//                 <img
//                   src={message.image}
//                   alt="Attachment"
//                   className="sm:max-w-[200px] rounded-md mb-2"
//                 />
//               )}
//               {message.text && <p>{message.text}</p>}
//             </div>
//           </div>
//         ))}
//       </div>

//       <MessageInput />
//     </div>
//   );
// };
// export default ChatContainer;
