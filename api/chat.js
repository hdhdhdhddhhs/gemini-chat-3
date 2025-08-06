import { useState } from "react";

export default function ChatPage() {
  const [userInput, setUserInput] = useState("");
  const [chatLog, setChatLog] = useState([]);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    // Add user message to chat log
    setChatLog((prev) => [...prev, { sender: "user", text: userInput }]);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput })
      });

      const data = await res.json();

      if (data.reply) {
        setChatLog((prev) => [...prev, { sender: "bot", text: data.reply }]);
      } else {
        setChatLog((prev) => [...prev, { sender: "bot", text: "No reply received." }]);
      }
    } catch (err) {
      setChatLog((prev) => [...prev, { sender: "bot", text: "Error occurred." }]);
    }

    setUserInput("");
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>💬 Gemini Chat</h2>
      <div style={{ marginBottom: "1rem" }}>
        {chatLog.map((msg, i) => (
          <div key={i} style={{ margin: "0.5rem 0" }}>
            <strong>{msg.sender === "user" ? "You" : "Gemini"}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Type your message..."
        style={{ width: "70%", padding: "0.5rem" }}
      />
      <button onClick={sendMessage} style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}>
        Send
      </button>
    </div>
  );
}
