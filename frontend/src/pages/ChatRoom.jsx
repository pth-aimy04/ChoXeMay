import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function ChatRoom() {
    const { conversation_id } = useParams();
    const [messages, setMessages] = useState([]);
    const [messageContent, setMessageContent] = useState("");

    const currentUser = JSON.parse(localStorage.getItem("user"));
    const bottomRef = useRef(null);

    useEffect(() => {
        fetchMessages();
        markAsRead();
    }, [conversation_id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await axiosClient.get(`/chat/${conversation_id}/messages`);
            setMessages(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const markAsRead = async () => {
        try {
            await axiosClient.put(`/chat/${conversation_id}/read`);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();

        if (!messageContent.trim()) return;

        try {
            await axiosClient.post(`/chat/${conversation_id}/messages`, {
                message_content: messageContent
            });

            setMessageContent("");
            fetchMessages();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Không thể gửi tin nhắn");
        }
    };

    return (
        <main className="chat-room-page">
            <section className="chat-room">
                <div className="chat-room-header">
                    <Link to="/messages" className="back-chat-btn">
                        <ArrowLeft size={20} />
                    </Link>

                    <h2>Cuộc trò chuyện</h2>
                </div>

                <div className="chat-message-list">
                    {messages.map((msg) => (
                        <div
                            key={msg.message_id}
                            className={
                                msg.sender_id === currentUser.user_id
                                    ? "chat-message-row mine"
                                    : "chat-message-row other"
                            }
                        >
                            <div className="chat-bubble">
                                {msg.message_content}
                            </div>
                        </div>
                    ))}

                    <div ref={bottomRef}></div>
                </div>

                <form className="chat-input-form" onSubmit={handleSend}>
                    <input
                        type="text"
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                    />

                    <button type="submit">
                        <Send size={18} />
                    </button>
                </form>
            </section>
        </main>
    );
}