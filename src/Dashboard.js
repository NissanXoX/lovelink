import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';

function Dashboard({ onNavigate }) {
  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', textAlign: 'center' }}>
      <h2>Welcome to LoveLink!</h2>

      <button onClick={() => onNavigate('profile')} style={btnStyle}>
        Profile
      </button>
      <button onClick={() => onNavigate('findMatch')} style={btnStyle}>
        Find Match
      </button>
      <button onClick={() => onNavigate('chat')} style={btnStyle}>
        Chat
      </button>
      <button
        onClick={() => {
          signOut(auth);
          alert('Logged out!');
        }}
        style={{ ...btnStyle, backgroundColor: '#e2436d' }}
      >
        Logout
      </button>
    </div>
  );
}

const btnStyle = {
  display: 'block',
  width: '100%',
  padding: '12px',
  marginBottom: '1rem',
  fontSize: '1.2rem',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#ff4f81',
  color: 'white',
  cursor: 'pointer',
};

export default Dashboard;
