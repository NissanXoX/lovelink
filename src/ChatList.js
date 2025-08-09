// src/ChatList.js
import { useEffect, useState } from 'react';
import { db, auth } from './firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';

function ChatList({ onSelectChat }) {
  const currentUserId = auth.currentUser.uid;
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        // Query matches where current user is in 'users' array
        const matchesQuery = query(
          collection(db, 'matches'),
          where('users', 'array-contains', currentUserId),
          orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(matchesQuery);

        const chatsData = await Promise.all(
          querySnapshot.docs.map(async (matchDoc) => {
            const match = matchDoc.data();
            const otherUserId = match.users.find((id) => id !== currentUserId);

            // Get other user's profile
            const profileDoc = await getDoc(doc(db, 'profiles', otherUserId));
            const profileData = profileDoc.exists() ? profileDoc.data() : {};

            // Get last message from chat subcollection
            const messagesRef = collection(db, 'chats', matchDoc.id, 'messages');
            const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'));
            const messagesSnapshot = await getDocs(messagesQuery);

            let lastMessage = null;
            if (!messagesSnapshot.empty) {
              lastMessage = messagesSnapshot.docs[0].data();
            }

            return {
              chatId: matchDoc.id,
              userId: otherUserId,
              name: profileData.name || 'Unknown',
              avatar: profileData.imageUrl || 'https://via.placeholder.com/50',
              lastMessage,
            };
          })
        );

        setChats(chatsData);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [currentUserId]);

  if (loading) return <p>Loading chats...</p>;
  if (chats.length === 0) return <p>No matches yet. Keep swiping!</p>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '0 1rem' }}>
      <h2>Your Chats</h2>
      {chats.map((chat) => {
        const isSentByCurrentUser = chat.lastMessage?.senderId === currentUserId;
        const lastText = chat.lastMessage?.text || '';
        const timestamp = chat.lastMessage?.timestamp
          ? new Date(chat.lastMessage.timestamp.seconds * 1000)
          : null;

        return (
          <div
            key={chat.chatId}
            onClick={() => onSelectChat(chat)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              borderBottom: '1px solid #eee',
              borderRadius: 8,
              backgroundColor: '#fff',
              marginBottom: 10,
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
          >
            <img
              src={chat.avatar}
              alt={chat.name}
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                objectFit: 'cover',
                marginRight: 15,
                boxShadow: '0 0 6px rgba(0,0,0,0.1)',
              }}
            />
            <div style={{ flexGrow: 1 }}>
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  marginBottom: 4,
                }}
              >
                {chat.name}
              </div>
              <div
                style={{
                  color: '#555',
                  fontSize: '0.9rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
                title={lastText}
              >
                {isSentByCurrentUser ? 'You: ' : ''}
                {lastText}
              </div>
            </div>
            {timestamp && (
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#999',
                  marginLeft: 10,
                  whiteSpace: 'nowrap',
                }}
              >
                {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ChatList;
