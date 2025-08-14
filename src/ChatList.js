import { useEffect, useState } from 'react';
import { db, auth } from './firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc
} from 'firebase/firestore';

function ChatList({ onSelectChat }) {
  const currentUserId = auth.currentUser.uid;
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const matchesQuery = query(
      collection(db, 'matches'),
      where('users', 'array-contains', currentUserId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(matchesQuery, async (snapshot) => {
      const chatsData = await Promise.all(
        snapshot.docs.map(async (matchDoc) => {
          const match = matchDoc.data();
          const otherUserId = match.users.find((id) => id !== currentUserId);

          // Get profile of the other user
          const profileDoc = await getDoc(doc(db, 'profiles', otherUserId));
          const profileData = profileDoc.exists() ? profileDoc.data() : {};

          // Get last message
          const chatDoc = await getDoc(doc(db, 'chats', matchDoc.id));
          const chatData = chatDoc.exists() ? chatDoc.data() : {};
          const lastMessage = chatData.lastMessage || null;
          const unread = chatData.unread?.[currentUserId] || false;

          return {
            chatId: matchDoc.id,
            matchDocId: matchDoc.id,
            userId: otherUserId,
            name: profileData.name || 'Unknown',
            avatar: profileData.imageUrl || 'https://via.placeholder.com/50',
            lastMessage,
            unread,
            timestamp: lastMessage?.timestamp?.seconds || match.timestamp?.seconds || 0
          };
        })
      );

      // Sort by latest timestamp
      chatsData.sort((a, b) => b.timestamp - a.timestamp);

      setChats(chatsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const handleUnmatch = async (chat) => {
    if (!window.confirm(`Are you sure you want to unmatch with ${chat.name}? This cannot be undone.`)) return;

    try {
      // Delete match document
      await deleteDoc(doc(db, 'matches', chat.matchDocId));

      // Delete chat document
      await deleteDoc(doc(db, 'chats', chat.chatId));

      // Remove from local state
      setChats((prev) => prev.filter((c) => c.chatId !== chat.chatId));
    } catch (error) {
      console.error('Error unmatching:', error);
    }
  };

  if (loading) return <p>Loading chats...</p>;
  if (chats.length === 0) return <p>No matches yet. Keep swiping!</p>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '0 1rem' }}>
      <h2 style={{ color: '#000' }}>Your Chats</h2>
      {chats.map((chat) => {
        const isSentByCurrentUser = chat.lastMessage?.senderId === currentUserId;
        const lastText = chat.lastMessage?.text || '';
        const timestamp = chat.lastMessage?.timestamp
          ? new Date(chat.lastMessage.timestamp.seconds * 1000)
          : null;

        return (
          <div
            key={chat.chatId}
            style={{
              position: 'relative',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              borderBottom: '1px solid #eee',
              borderRadius: 8,
              backgroundColor: '#fff',
              marginBottom: 10,
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}
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
              }}
              onClick={() => onSelectChat(chat)}
            />
            <div style={{ flexGrow: 1 }} onClick={() => onSelectChat(chat)}>
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  marginBottom: 4,
                  color: '#000',
                }}
              >
                {chat.name}
              </div>
              <div
                style={{
                  color: '#000',
                  fontSize: '0.9rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {isSentByCurrentUser ? 'You: ' : ''}
                {lastText}
              </div>
            </div>
            {timestamp && (
              <div style={{ fontSize: '0.75rem', color: '#999', marginLeft: 10 }}>
                {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
            {chat.unread && (
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 60,
                  backgroundColor: '#ff4f81',
                  color: '#fff',
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 12,
                  fontWeight: 'bold'
                }}
              >
                New
              </div>
            )}
            <button
              onClick={() => handleUnmatch(chat)}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: '#ff3b30',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 'bold',
              }}
            >
              Unmatch
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ChatList;
