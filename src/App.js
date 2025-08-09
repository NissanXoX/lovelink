// src/App.js
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import AuthForm from './AuthForm';
import ProfileForm from './ProfileForm';
import SwipeCards from './SwipeCards';
import ChatList from './ChatList';
import ChatRoom from './ChatRoom';

// Splash Screen Component
function SplashScreen() {
  return (
    <div
      style={{
        height: '100vh',
        background: 'linear-gradient(to bottom right, #ff4f81, #ffd166)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: 'white',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1 style={{ fontSize: '3rem', animation: 'bounce 1.5s infinite' }}>
        LoveLink ❤️
      </h1>
      <p style={{ marginTop: '1rem' }}>Finding your perfect match...</p>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // login, profile, swipe, chat, chatroom
  const [chatWith, setChatWith] = useState(null);
  const [chatWithUserInfo, setChatWithUserInfo] = useState(null); // full user info for chat room

  // Splash screen timer (5 seconds)
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setView('login');
      } else {
        setView('profile'); // default after login
      }
    });
    return () => unsubscribe();
  }, []);

  if (showSplash) return <SplashScreen />;

  if (!user) return <AuthForm />;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #ff4f81, #ffd166)',
        color: 'white',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: '2rem',
        boxSizing: 'border-box',
        textAlign: 'center',
      }}
    >
      <h1 style={{ marginBottom: '1rem' }}>LoveLink ❤️</h1>

      {/* Navigation bar */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setView('profile')}
          style={{
            marginRight: '0.5rem',
            fontWeight: view === 'profile' ? 'bold' : 'normal',
            background: 'transparent',
            border: '2px solid white',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          👤 Profile
        </button>
        <button
          onClick={() => setView('swipe')}
          style={{
            marginRight: '0.5rem',
            fontWeight: view === 'swipe' ? 'bold' : 'normal',
            background: 'transparent',
            border: '2px solid white',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          💘 Find Matches
        </button>
        <button
          onClick={() => setView('chat')}
          style={{
            fontWeight: view === 'chat' ? 'bold' : 'normal',
            background: 'transparent',
            border: '2px solid white',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          💬 Chats
        </button>
        <button
          onClick={() => signOut(auth)}
          style={{
            marginLeft: '1rem',
            backgroundColor: '#e2436d',
            border: 'none',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* Render views */}
      {view === 'profile' && <ProfileForm />}
      {view === 'swipe' && <SwipeCards />}
      {view === 'chat' && (
        <ChatList
          onSelectChat={(user) => {
            setChatWith(user.userId);
            setChatWithUserInfo(user);
            setView('chatroom');
          }}
        />
      )}
      {view === 'chatroom' && chatWith && (
        <ChatRoom
          chatWithUserId={chatWith}
          chatUser={chatWithUserInfo}
          onBack={() => setView('chat')}
        />
      )}
    </div>
  );
}

export default App;
