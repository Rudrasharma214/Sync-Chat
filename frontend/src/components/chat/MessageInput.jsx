import React, { useRef, useState } from "react";
import { Send } from "lucide-react";
import { useSendMessage } from "../../hooks/useMutation/messageMutation";

const MessageInput = ({ socket, conversationId }) => {
    const [text, setText] = useState("");
    const lastTypingEmitRef = useRef(0);

    const sendMessageMutation = useSendMessage();

    const handleChange = (event) => {
        const nextValue = event.target.value;
        setText(nextValue);

        if (!socket || !conversationId || !nextValue.trim()) {
            return;
        }

        const now = Date.now();
        if (now - lastTypingEmitRef.current >= 800) {
            socket.emit("typing", { conversationId });
            lastTypingEmitRef.current = now;
        }
    };

    const handleSend = async (event) => {
        event.preventDefault();

        const content = text.trim();
        if (!content || !conversationId) {
            return;
        }

        await sendMessageMutation.mutateAsync({ conversationId, content });
        setText("");
    };

    return (
        <footer className="theme-border border-t p-2 sm:p-3">
            <form
                onSubmit={handleSend}
                className="theme-border mx-auto flex w-full max-w-[720px] items-center gap-2 rounded-2xl border bg-[var(--surface-soft)] px-2 py-1 sm:gap-2.5 sm:px-3 sm:py-1.5"
            >
                <input
                    type="text"
                    className="theme-text h-8 w-full bg-transparent text-sm outline-none"
                    placeholder="Type your message"
                    value={text}
                    onChange={handleChange}
                    disabled={!conversationId || sendMessageMutation.isPending}
                />
                <button
                    type="submit"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-slate-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 sm:h-9 sm:w-9 sm:rounded-xl"
                    aria-label="Send message"
                    title="Send"
                    disabled={!text.trim() || !conversationId || sendMessageMutation.isPending}
                >
                    <Send className="h-4 w-4" />
                </button>
            </form>
        </footer>
    );
};

export default MessageInput;
