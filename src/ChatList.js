// src/ChatList.js
import { useEffect, useState } from 'react';
import { db, auth } from './firebase';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';

function ChatList({ onSelectChat }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const currentUserId = auth.currentUser.uid;
       // const q = query(collection(db, 'matches'), /* no filters, just using array-contains in App */);
        const querySnapshot = await getDocs(
          query(collection(db, 'matches'), query(collection(db, 'matches'), query(collection(db, 'matches'))))
        );

        const matchedProfiles = [];

        for (const matchDoc of querySnapshot.docs) {
          const users = matchDoc.data().users;
          const matchedUserId = users.find((id) => id !== currentUserId);
          const profileDoc = await getDoc(doc(db, 'profiles', matchedUserId));
          if (profileDoc.exists()) {
            matchedProfiles.push({ id: matchedUserId, ...profileDoc.data() });
          }
        }

        setMatches(matchedProfiles);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) return <p>Loading chats...</p>;
  if (matches.length === 0) return <p>No matches yet. Keep swiping!</p>;

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>Your Chats</h2>
      {matches.map((profile) => (
        <div
          key={profile.id}
          style={{
            border: '1px solid #ccc',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1rem',
            maxWidth: '300px',
            margin: 'auto',
          }}
        >
          <h3>
            {profile.name}, {profile.age}
          </h3>
          <button onClick={() => onSelectChat(profile.id)}>Chat</button>
        </div>
      ))}
    </div>
  );
}

export default ChatList;
