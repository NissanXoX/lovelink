// src/App.js
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import AuthForm from './AuthForm';
import ProfileForm from './ProfileForm';
import SwipeCards from './SwipeCards';
import ChatList from './ChatList';
import ChatRoom from './ChatRoom';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('profile'); // profile, swipe, chat, chatroom
  const [chatWith, setChatWith] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setView('login');
      } else {
        setView('profile');
      }
    });

    return () => unsubscribe();
  }, []);

  // Render
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>LoveLink ❤️</h1>

      {!user ? (
        <AuthForm />
      ) : (
        <>
          {/* Logout & Navigation */}
          <div style={{ marginBottom: '1rem' }}>
            <button onClick={() => signOut(auth)} style={{ marginRight: '1rem' }}>
              🚪 Logout
            </button>
            <button onClick={() => setView('profile')} style={{ marginRight: '0.5rem' }}>
              👤 Profile
            </button>
            <button onClick={() => setView('swipe')} style={{ marginRight: '0.5rem' }}>
              💘 Find Matches
            </button>
            <button onClick={() => setView('chat')}>
              💬 Chats
            </button>
          </div>

          {/* View Logic */}
          {view === 'profile' && <ProfileForm />}
          {view === 'swipe' && <SwipeCards />}
          {view === 'chat' && (
            <ChatList
              onSelectChat={(userId) => {
                setChatWith(userId);
                setView('chatroom');
              }}
            />
          )}
          {view === 'chatroom' && chatWith && (
            <ChatRoom chatWithUserId={chatWith} />
          )}
        </>
      )}
    </div>
  );
}

export default App;
