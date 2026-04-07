import React, { useMemo, useState } from "react";
import { Circle, FileText, Image, Link2 } from "lucide-react";
import DetailPopupLayout from "./DetailPopupLayout";

const ContactProfileModal = ({ isOpen, onClose, contact }) => {
    const [activeTab, setActiveTab] = useState("overview");

    const tabs = useMemo(
        () => [
            { key: "overview", label: "Overview", icon: Circle },
            { key: "media", label: "Media", icon: Image },
            { key: "files", label: "Files", icon: FileText },
            { key: "links", label: "Links", icon: Link2 },
        ],
        []
    );

    return (
        <DetailPopupLayout
            isOpen={isOpen}
            onClose={onClose}
            title="Contact info"
            subtitle="Chat details and media"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {activeTab === "overview" ? (
                <div className="mx-auto w-full max-w-lg">
                    <div className="flex flex-col items-center text-center">
                        <img
                            src={contact?.avatar}
                            alt={contact?.name}
                            className="h-24 w-24 rounded-full object-cover"
                        />
                        <h3 className="theme-text mt-3 text-3xl font-semibold">{contact?.name}</h3>
                    </div>

                    <div className="mt-8">
                        <p className="theme-muted text-sm">About</p>
                        <p className="theme-text mt-1 text-base italic opacity-80">
                            {contact?.about || "No description available"}
                        </p>
                    </div>

                    <div className="theme-border mt-5 rounded-2xl border p-3">
                        <p className="theme-muted text-xs">Email</p>
                        <p className="theme-text mt-1 text-sm">{contact?.email || "Not provided"}</p>
                    </div>

                    <div className="theme-border mt-3 rounded-2xl border p-3">
                        <p className="theme-muted text-xs">Phone</p>
                        <p className="theme-text mt-1 text-sm">{contact?.phone || "Not provided"}</p>
                    </div>
                </div>
            ) : (
                <div className="theme-muted py-10 text-center text-sm">
                    No {activeTab} available for this contact yet.
                </div>
            )}
        </DetailPopupLayout>
    );
};

export default ContactProfileModal;
