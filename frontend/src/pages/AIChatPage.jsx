import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Image as ImageIcon, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import vscDarkPlus from "react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus";
import { axiosIN } from "../lib/axios.js";


const AIChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const clearImageSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && !selectedImage) return;

    const question = input.trim();
    const currentMessages = [...messages];

    currentMessages.push({
      role: "user",
      content: question,
      image: imagePreview,
    });
    setMessages(currentMessages);
    setInput("");
    clearImageSelection();
    setLoading(true);

    let imageBase64 = null;
    if (selectedImage) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      imageBase64 = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
      });
    }

    try {
      const payload = { question: question };
      if (imageBase64) {
        payload.image = imageBase64;
      }

      const res = await axiosIN.post(
        "/aichat/ai",
        payload,
        { withCredentials: true }
      );

      const answer = res.data.reply || "No response from AI.";
      setMessages((prev) => [...prev, { role: "ai", content: answer }]);
    } catch (err) {
      console.error("AI Error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "❌ Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axiosIN.get(
          "/aichat/history",
          {
            withCredentials: true,
          }
        );
        if (res.data.success) {
          setMessages(res.data.chats);
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };

    fetchHistory();
  }, []);

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen w-screen bg-base-200 p-4">
      <div className="py-4 text-center">
        <h2 className="text-2xl font-bold text-base-content">
          🤖 AI Chat Assistant
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-base-100 rounded-box shadow border border-base-300 w-full">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-box text-sm leading-relaxed w-fit ${
              // w-fit ensures it shrinks to content
              msg.role === "user"
                ? "ml-auto bg-primary text-primary-content whitespace-pre-wrap"
                : "mr-auto bg-base-200 text-base-content border border-base-300"
            } max-w-[80%]`}
          >
            {msg.image && (
              <img
                src={msg.image}
                alt={msg.role === "user" ? "User upload" : "AI Generated"}
                className="sm:max-w-[400px] rounded-md mb-2"
                // Optional: Fallback for broken images
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/150x100/E0E0E0/333333?text=Image+Error";
                }}
              />
            )}

            {msg.content &&
              msg.content.trim() !== "" &&
              (msg.role === "ai" ? (
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          {...props}
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code {...props} className={className}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                msg.content
              ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-3 flex items-end gap-2 max-w-3xl mx-auto w-full bg-base-100 px-3 py-1.5 rounded-box shadow border border-base-300">
        {imagePreview && (
          <div className="relative flex-shrink-0 w-20 h-20">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover rounded-md border border-base-300"
            />
            <button
              onClick={clearImageSelection}
              className="absolute -top-2 -right-2 bg-error text-error-content rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
              title="Clear Image"
            >
              X
            </button>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="btn btn-ghost btn-circle btn-sm flex-shrink-0"
          title="Upload Image"
          disabled={loading}
        >
          <ImageIcon className="w-5 h-5 text-base-content" />
        </button>

        <textarea
          rows="1"
          placeholder="Ask something..."
          className="flex-1 resize-y text-sm p-2 bg-base-200 rounded-md border border-base-300 focus:outline-none focus:ring focus:ring-primary
                     min-h-[2.5rem] max-h-[10rem] overflow-y-auto"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          className="btn btn-primary btn-sm rounded-full p-2 min-h-[2rem] h-[2rem] w-[2.5rem] flex-shrink-0"
          disabled={loading}
          title="Send Message"
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
        {/* <button
          onClick={generateImage}
          className="btn btn-secondary btn-sm rounded-full p-2 min-h-[2rem] h-[2rem] w-[2.5rem] flex-shrink-0"
          disabled={loading || !input.trim()}
          title="Generate Image"
        >
          <Sparkles className="w-4 h-4" />
        </button> */}
      </div>
    </div>
  );
};

export default AIChatPage;
