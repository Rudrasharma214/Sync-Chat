import { X, ChevronLeft } from "lucide-react"; // Import ChevronLeft
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

// Accept the onBack prop
const ChatHeader = ({ onBack }) => { 
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  // If no user is selected, render a placeholder header
  if (!selectedUser) {
    return (
      <div className="p-2.5 border-b border-base-300">
        <h2 className="text-xl font-semibold text-center">Chat</h2>
      </div>
    );
  }

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back button visible only on small screens (hidden on lg and above) */}
          <button 
            onClick={onBack} // Use the onBack prop
            className="lg:hidden btn btn-ghost btn-circle btn-sm" // Add btn-sm for smaller size
            aria-label="Back to contacts"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilepic || "/avatar.png"} alt={selectedUser.fullname} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullname}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button visible only on larger screens (hidden on lg and below) */}
        <button 
          onClick={() => setSelectedUser(null)}
          className="hidden lg:block btn btn-ghost btn-circle btn-sm" // Added btn-sm and responsive class
          aria-label="Close chat"
        >
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;