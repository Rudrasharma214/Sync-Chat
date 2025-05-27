import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import { useState, useEffect } from "react";

const Home = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  
  // State to control sidebar visibility on small screens.
  // Initialize based on current screen width and whether a user is already selected.
  const [isSidebarVisible, setIsSidebarVisible] = useState(() => {
    const isSmallScreen = window.innerWidth < 1024; // Tailwind's 'lg' breakpoint
    // On small screens, sidebar is visible if no user is selected.
    // On large screens, sidebar is always visible, so this initial state doesn't matter for them.
    return isSmallScreen ? !selectedUser : true;
  });

  // Effect to update sidebar visibility based on screen size and selected user.
  useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.innerWidth < 1024;
      if (isSmallScreen) {
        // On small screens:
        // If a user is selected, hide the sidebar to show the chat container.
        // If no user is selected, show the sidebar.
        setIsSidebarVisible(!selectedUser);
      } else {
        // On large screens, the sidebar should always be visible.
        setIsSidebarVisible(true);
      }
    };

    // Set initial visibility when the component mounts
    handleResize();

    // Add event listener for window resize to handle orientation changes or window resizing
    window.addEventListener('resize', handleResize);

    // Cleanup function to remove the event listener when the component unmounts
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedUser]); // Re-run this effect when selectedUser changes

  // Function to handle going back from the chat view to the sidebar on small screens
  const handleBackToSidebar = () => {
    setSelectedUser(null); // Deselect the current user
    setIsSidebarVisible(true); // Explicitly show the sidebar
  };

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            {/* Sidebar:
                - On large screens (lg:), it's always 'block' (visible).
                - On small screens, its visibility is controlled by 'isSidebarVisible'.
                - It takes full width on small screens and specific width on large screens. */}
            <div className={`
              ${isSidebarVisible ? 'block' : 'hidden'} 
              lg:block w-full lg:w-72 
              border-r border-base-300 transition-all duration-200
            `}>
              <Sidebar />
            </div>

            {/* ChatContainer Wrapper:
                - IMPORTANT: Added 'h-full' here to ensure it takes full height.
                - On large screens (lg:), it's always 'block' (visible).
                - On small screens, it's 'block' only if the sidebar is NOT visible (i.e., a user is selected).
                - It takes 'flex-1' to fill remaining horizontal space. */}
            <div className={`
              flex-1 h-full 
              ${!isSidebarVisible ? 'block' : 'hidden'} 
              lg:block
            `}>
              {!selectedUser ? (
                // Display NoChatSelected when no user is selected
                <NoChatSelected />
              ) : (
                // Display ChatContainer when a user is selected, passing the back handler
                <ChatContainer onBack={handleBackToSidebar} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Home;