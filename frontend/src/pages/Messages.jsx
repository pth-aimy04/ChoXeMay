import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";


const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace("/api", "");

export default function Messages() {
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const res = await axiosClient.get("/chat/conversations");
            setConversations(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <main className="messages-page">
            <h1>Tin nhắn</h1>

            <section className="conversation-list">
                {conversations.length === 0 ? (
                    <div className="empty-chat">
                        Bạn chưa có cuộc trò chuyện nào.
                    </div>
                ) : (
                    conversations.map((item) => (
                        <Link
                            to={`/messages/${item.conversation_id}`}
                            className="conversation-card"
                            key={item.conversation_id}
                        >
                            <img
                                src={
                                    item.post_image
                                        ? `${API_URL}${item.post_image}`
                                        : "/default-bike.png"
                                }
                                alt={item.post_title}
                            />

                            <div className="conversation-content">
                                <div className="conversation-top">
                                    <h3>{item.other_user_name}</h3>

                                    {item.unread_count > 0 && (
                                        <span className="chat-badge">
                                            {item.unread_count}
                                        </span>
                                    )}
                                </div>

                                <p className="conversation-post">
                                    {item.post_title}
                                </p>

                                <p className="conversation-last">
                                    {item.last_message || "Chưa có tin nhắn"}
                                </p>
                            </div>
                        </Link>
                    ))
                )}
            </section>
        </main>
    );
}







