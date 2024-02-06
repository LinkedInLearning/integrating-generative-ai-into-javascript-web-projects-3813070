import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const data = [
  {
    sender: "user",
    timestamp: "2024-02-04T10:00:00Z",
    content: "What's the weather like today?",
  },
  {
    sender: "ai_assistant",
    timestamp: "2024-02-04T10:00:05Z",
    content:
      "The weather today is sunny with a high of 75 degrees and a low of 55 degrees.",
  },
  {
    sender: "user",
    timestamp: "2024-02-04T10:05:00Z",
    content: "Can you remind me to call John at 2 PM?",
  },
  {
    sender: "ai_assistant",
    timestamp: "2024-02-04T10:05:05Z",
    content: "Sure, I've set a reminder for you to call John at 2 PM today.",
  },
  {
    sender: "user",
    timestamp: "2024-02-04T10:10:00Z",
    content: "How do I make a lasagna?",
  },
  {
    sender: "ai_assistant",
    timestamp: "2024-02-04T10:10:15Z",
    content:
      "To make a lasagna, you will need lasagna noodles, marinara sauce, ricotta cheese, grated Parmesan cheese, ground beef, and mozzarella cheese. First, cook the noodles according to the package instructions. In a separate pan, cook the ground beef and add marinara sauce. In a baking dish, layer the noodles, beef sauce, ricotta cheese, and mozzarella cheese, then repeat the layers until all ingredients are used. Top with grated Parmesan cheese and bake in a preheated oven at 375°F for 45 minutes.",
  },
  {
    sender: "user",
    timestamp: "2024-02-04T10:15:00Z",
    content: "Play some relaxing music.",
  },
  {
    sender: "ai_assistant",
    timestamp: "2024-02-04T10:15:05Z",
    content: "Playing relaxing music now.",
  },
  {
    sender: "ai_assistant",
    timestamp: "2024-02-04T10:05:05Z",
    content: "Sure, I've set a reminder for you to call John at 2 PM today.",
  },
  {
    sender: "user",
    timestamp: "2024-02-04T10:10:00Z",
    content: "How do I make a lasagna?",
  },
  {
    sender: "ai_assistant",
    timestamp: "2024-02-04T10:10:15Z",
    content:
      "To make a lasagna, you will need lasagna noodles, marinara sauce, ricotta cheese, grated Parmesan cheese, ground beef, and mozzarella cheese. First, cook the noodles according to the package instructions. In a separate pan, cook the ground beef and add marinara sauce. In a baking dish, layer the noodles, beef sauce, ricotta cheese, and mozzarella cheese, then repeat the layers until all ingredients are used. Top with grated Parmesan cheese and bake in a preheated oven at 375°F for 45 minutes.",
  },
];

function App() {
  const inputRef = useRef();
  const messagesEndRef = useRef(null); // useRef for scrolling to the bottom of the messages

  const [messages, setMessages] = useState(data);
  const [thread, setThread] = useState(null); // useState for the thread ID
  const [userMessage, setUserMessage] = useState("");
  const [isGenerating, setGenerating] = useState(false);

  const refs = useRef(messages.map(() => React.createRef()));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = (message) => {
    fetch("http://localhost:4000/sendMessage", { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: message }),
    })
    .then(response => response.json())
    .then(response => {
      setMessages(prevMessages => [...prevMessages, response]);
    })
    .catch((error) => {
        console.error("Error:", error); // Handle the error
    });
  }

  const handleOnChange = (e) => setUserMessage(e.target.value);
  const handleOnSubmit = (e) => {
    e.preventDefault();
    if (userMessage === "") return;
    setMessages([
      ...messages,
      {
        sender: "user",
        content: userMessage,
        timestamp: new Date(),
      },
    ]);
    sendMessage(userMessage)
    inputRef.current.value = "";
  };

  const handleKeyPress = (e) => {
    // Check if Enter was pressed without shift key
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent the default action to avoid line break in textarea
      handleOnSubmit(e); // Call your existing submit handler
    }
  };
  useEffect(() => {
    scrollToBottom(); // Call scrollToBottom whenever messages change
  }, [messages]);
  useEffect(() => {
    fetch("http://localhost:4000/")
      .then((res) => res.json())
      .then(setThread);
  }, []);

  return (
    <body>
      <div className="container">
        <div className="chat-container row d-flex flex-column justify-content-between">
          <div className="col-12 my-3">
            <div>
              <h1 className="text-center text-secondary my-1">
                🤖 AI Assistant
              </h1>
              <hr />
              <small className="text-muted">THREAD: {thread?.id} </small>
            </div>
          </div>
          <div className="messages">
            {messages.map((message, index) => {
              return (
                <div
                  key={message.timestamp}
                  className="d-flex flex-column"
                  ref={refs.current[index]}
                >
                  <small className="m-0 text-muted text-small">
                    {message.sender === "user" ? "User" : "Customer Support"}
                  </small>
                  <p>{message.content}</p>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleOnSubmit}>
            <div className="border rounded p-3 my-2 d-flex flex-column">
              <textarea
                className="text-input"
                ref={inputRef}
                rows="1"
                placeholder="Enter your message ..."
                onChange={handleOnChange}
                onKeyDown={handleKeyPress}
              ></textarea>
              <div className="d-flex justify-content-between">
                <p className="text-info m-0 align-self-end d-flex">
                  {isGenerating && (
                    <>
                      <div className="spinner mx-1 align-self-end "></div>
                      <span> Generating response...</span>
                    </>
                  )}
                </p>
                <button
                  type="submit"
                  className="mt-2 align-self-end btn btn-link"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="#000"
                    class="bi bi-send-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* <footer className="d-flex align-items-center justify-content-center position-relative bottom-0">
        <div className="text-center">© 2020 Copyright Sajjad Hussain</div>
      </footer> */}

      <script src="https://cdnjs.cloudflare.com/ajax/libs/material-ui/5.0.0-beta.5/index.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/material-ui/5.0.0-beta.5/index.js"></script>
    </body>
  );
}

export default App;
