import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = users.filter((user) => {
    // Exclude the authenticated user from the list
    if (authUser && user._id === authUser._id) {
      return false;
    }

    // Filter by online status if 'showOnlineOnly' is true
    if (showOnlineOnly && !onlineUsers.includes(user._id)) {
      return false;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      return user.fullname.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      return true;
    }
  });

  // Deselect user if they are no longer in the filtered list (e.g., due to search/online filter)
  useEffect(() => {
    if (selectedUser && !filteredUsers.some(user => user._id === selectedUser._id)) {
      setSelectedUser(null);
    }
  }, [filteredUsers, selectedUser, setSelectedUser]);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    // Adjusted responsive classes: sidebar is full width on small screens when visible
    <aside className="h-full w-full lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-4" />
          {/* Kept 'hidden lg:block' for "Contacts" title if space is an issue on very small screens, 
              but typically on mobile, you'd want this visible too.
              If you want it always visible, remove 'hidden lg:block'. */}
          <span className="font-medium hidden lg:block">Contacts</span> 
        </div>

        <div className="relative mt-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="size-5 text-base-content/40" />
          </div>
          <input
            type="text"
            placeholder="Search contact..."
            className="input input-bordered w-full pl-10 pr-3 rounded-md h-8 text-base-content bg-base-100 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => {
              setSelectedUser(user);
              // The HomePage's useEffect will handle hiding the sidebar
              // based on selectedUser change and screen size.
            }}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            {/* Removed 'mx-auto lg:mx-0' from the image container.
                The parent 'flex items-center' will handle alignment. */}
            <div className="relative"> 
              <img
                src={user.profilepic || "/avatar.png"}
                alt={user.fullname}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* REMOVED 'hidden' CLASS: Now the name and status will always be visible.
                Added 'flex-1' to allow it to take available space within the flex item. */}
            <div className="text-left min-w-0 flex-1"> 
              <div className="font-medium truncate">{user.fullname}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && searchQuery.trim() !== "" && (
          <div className="text-center text-zinc-500 py-4">No users found matching your search.</div>
        )}
        {filteredUsers.length === 0 && searchQuery.trim() === "" && (
          <div className="text-center text-zinc-500 py-4">Start typing to search for users or see your contacts.</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
