
import { useState } from "react";
import api from "../api/axios";
import "./AIAssistant.css";
import Sidebar from "../components/Sidebar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const suggestions = [
    {
        title: "Analyze my spending",
        message: "Summarize my expenditure and identify my biggest expenses."
    },
    {
        title: "Help me save",
        message: "Suggest three practical ways I can save more money."
    },
    {
        title: "Review my budget",
        message: "Review my budgets and tell me where I should be careful."
    },
    {
        title: "Savings goals",
        message: "Review my savings goals and suggest how I can reach them."
    }
];

function AIAssistant() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Hi! I'm your FinTrack AI assistant. I can help you understand your spending, review your budgets, and find practical ways to save. What would you like to explore?"
        }
    ]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const sendMessage = async (text) => {
        const question = text.trim();

        if (!question || loading) return;

        setMessages((previous) => [
            ...previous,
            { role: "user", content: question }
        ]);
        setInput("");
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/ai/chat", {
                message: question
            });

            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content: response.data.answer
                }
            ]);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Couldn't reach the AI assistant. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        sendMessage(input);
    };

    return (
    <div className="app-layout">
        <Sidebar />

        <div className="ai-page">
            <header className="ai-header">
                <div className="ai-brand">
                    <div className="ai-brand-icon">✦</div>
                    <div>
                        <h1>FinTrack AI</h1>
                        <p>Your personal finance assistant</p>
                    </div>
                </div>
            </header>

            <main className="ai-main">
                <section className="ai-welcome">
                    <span className="ai-eyebrow">YOUR FINANCIAL COMPANION</span>
                    <h2>Make smarter moves with your money.</h2>
                    <p>
                        Get insights into your expenditure, understand your
                        budgets, and discover ways to improve your savings.
                    </p>
                </section>

                <section className="ai-suggestions">
                    <h3>What can I help you with?</h3>

                    <div className="ai-suggestion-grid">
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion.title}
                                type="button"
                                className="ai-suggestion-card"
                                disabled={loading}
                                onClick={() =>
                                    sendMessage(suggestion.message)
                                }
                            >
                                <span>{suggestion.title}</span>
                                <span className="ai-card-arrow">↗</span>
                                <p>{suggestion.message}</p>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="ai-chat">
                    <div className="ai-chat-heading">
                        <div>
                            <h3>Chat with FinTrack AI</h3>
                            <p>Ask a question about your finances.</p>
                        </div>
                        <span className="ai-online">
                            <span className="ai-online-dot" />
                            AI assistant
                        </span>
                    </div>

                    <div className="ai-messages" aria-live="polite">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`ai-message ai-message-${message.role}`}
                            >
                                <div className="ai-avatar">
                                    {message.role === "assistant" ? "✦" : "You"}
                                </div>
                        <div className="ai-message-content">
                            <span className="ai-message-label">
                                {message.role === "assistant"
                                    ? "FinTrack AI"
                                    : "You"}
                           </span>
                            <div className="ai-markdown">
                                {message.role === "assistant" ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {message.content}
                                    </ReactMarkdown>
                                ) : (
                                    <p>{message.content}</p>
                                )}
                            </div>
                        </div>

                            </div>
                        ))}

                        {loading && (
                            <div className="ai-typing">
                                <span className="ai-typing-dot" />
                                <span className="ai-typing-dot" />
                                <span className="ai-typing-dot" />
                                <span>Analyzing your finances...</span>
                            </div>
                        )}

                        {error && (
                            <div className="ai-error" role="alert">
                                {error}
                                <button
                                    type="button"
                                    onClick={() => setError("")}
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}
                    </div>

                    <form className="ai-input-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            placeholder="Ask anything about your finances..."
                            maxLength={2000}
                            disabled={loading}
                            aria-label="Ask FinTrack AI a question"
                        />

                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                        >
                            {loading ? "Thinking..." : "Send ↑"}
                        </button>
                    </form>

                    <p className="ai-disclaimer">
                        AI suggestions are educational and may not always be
                        accurate. Review important financial decisions carefully.
                    </p>
                </section>
            </main>
        </div>
    </div>
    );
}

export default AIAssistant;
