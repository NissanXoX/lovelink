// src/ChatRoom.js
import { useEffect, useState, useRef } from 'react';
import { db, auth } from './firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

function ChatRoom({ chatWithUserId, onBack, chatUser }) {
  const currentUserId = auth.currentUser.uid;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const bottomRef = useRef();

  // Generate consistent chatId
  const chatId =
    currentUserId < chatWithUserId
      ? `${currentUserId}_${chatWithUserId}`
      : `${chatWithUserId}_${currentUserId}`;

  useEffect(() => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      senderId: currentUserId,
      text: newMessage.trim(),
      timestamp: serverTimestamp(),
    });

    setNewMessage('');
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: '2rem auto',
        display: 'flex',
        flexDirection: 'column',
        height: '80vh',
        border: '1px solid #ddd',
        borderRadius: 12,
        backgroundColor: '#fff',
        color: '#000', // text color black for readability
      }}
    >
      {/* Header with Back button and chat user */}
      <div
        style={{
          padding: '1rem',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <button
          onClick={onBack}
          style={{
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            fontSize: '1.5rem',
            fontWeight: 'bold',
          }}
          aria-label="Back to chat list"
        >
          ←
        </button>
        <img
          src={chatUser?.avatar || 'https://via.placeholder.com/40'}
          alt="User avatar"
          style={{ width: 40, height: 40, borderRadius: '50%' }}
        />
        <h3 style={{ margin: 0 }}>{chatUser?.name || 'Chat'}</h3>
      </div>

      {/* Messages container */}
      <div
        style={{
          flex: 1,
          padding: '1rem',
          overflowY: 'auto',
          backgroundColor: '#f9f9f9',
        }}
      >
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999' }}>No messages yet</p>
        )}

        {messages.map((msg) => {
          const isCurrentUser = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                marginBottom: 12,
                gap: 10,
                alignItems: 'flex-end',
              }}
            >
              {!isCurrentUser && (
                <img
                  src={chatUser?.avatar || 'https://via.placeholder.com/32'}
                  alt="avatar"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                  }}
                />
              )}

              <div
                style={{
                  maxWidth: '70%',
                  padding: '10px 14px',
                  borderRadius: 20,
                  backgroundColor: isCurrentUser ? '#ff4f81' : '#eee',
                  color: isCurrentUser ? '#fff' : '#000',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  wordBreak: 'break-word',
                  position: 'relative',
                }}
              >
                {msg.text}
                <div
                  style={{
                    fontSize: 10,
                    color: isCurrentUser ? '#ffc1d1' : '#555',
                    marginTop: 4,
                    textAlign: 'right',
                    userSelect: 'none',
                    opacity: 0.7,
                  }}
                >
                  {msg.timestamp
                    ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '...'}
                </div>
              </div>

              {isCurrentUser && (
                <img
                  src={auth.currentUser.photoURL || 'https://via.placeholder.com/32'}
                  alt="avatar"
                  style={{ width: 32, height: 32, borderRadius: '50%' }}
                />
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        style={{
          display: 'flex',
          borderTop: '1px solid #ddd',
          padding: '0.5rem 1rem',
          gap: 8,
        }}
      >
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{
            flexGrow: 1,
            padding: '0.75rem 1rem',
            borderRadius: 20,
            border: '1px solid #ccc',
            fontSize: '1rem',
            outline: 'none',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          type="submit"
          style={{
            padding: '0 1.5rem',
            borderRadius: 20,
            backgroundColor: '#ff4f81',
            border: 'none',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatRoom;
