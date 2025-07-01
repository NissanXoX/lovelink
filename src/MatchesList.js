// src/MatchesList.js
import { useEffect, useState } from 'react';
import { db, auth } from './firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

function MatchesList() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const currentUserId = auth.currentUser.uid;

        // Query matches where current user is part of the 'users' array
        const q = query(collection(db, 'matches'), where('users', 'array-contains', currentUserId));
        const querySnapshot = await getDocs(q);

        const matchedProfiles = [];

        for (const matchDoc of querySnapshot.docs) {
          const users = matchDoc.data().users;

          // Find the matched user (not current user)
          const matchedUserId = users.find((id) => id !== currentUserId);

          // Fetch that user's profile
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

  if (loading) return <p>Loading matches...</p>;

  if (matches.length === 0) return <p>No matches yet. Keep swiping! ❤️</p>;

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>Your Matches</h2>
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
          <p>{profile.bio}</p>
        </div>
      ))}
    </div>
  );
}

export default MatchesList;
