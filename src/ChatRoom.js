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

function ChatRoom({ chatWithUserId }) {
  const currentUserId = auth.currentUser.uid;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const bottomRef = useRef();

  // Unique chat ID for consistency
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
    <div style={{ maxWidth: 400, margin: 'auto', textAlign: 'left' }}>
      <h3>Chat</h3>
      <div
        style={{
          height: 300,
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              marginBottom: '0.5rem',
              textAlign: msg.senderId === currentUserId ? 'right' : 'left',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                backgroundColor: msg.senderId === currentUserId ? '#DCF8C6' : '#ECECEC',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                maxWidth: '80%',
                wordWrap: 'break-word',
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex' }}>
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{
            flexGrow: 1,
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
        />
        <button onClick={sendMessage} style={{ marginLeft: '0.5rem' }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatRoom;
