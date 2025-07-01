import { useEffect, useState } from 'react';
import { db, auth } from './firebase';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';

function SwipeCards() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'profiles'));
        const currentUserId = auth.currentUser.uid;
        const results = [];

        querySnapshot.forEach((doc) => {
          if (doc.id !== currentUserId) {
            results.push({ id: doc.id, ...doc.data() });
          }
        });

        setProfiles(results);
      } catch (error) {
        console.error('Error fetching profiles:', error);
      }
    };

    fetchProfiles();
  }, []);

  const handleAction = async (profileId, action) => {
    try {
      const currentUserId = auth.currentUser.uid;

      // Save like or skip
      await addDoc(collection(db, 'likes'), {
        likerId: currentUserId,
        likedId: profileId,
        status: action,
        timestamp: new Date()
      });

      if (action === 'like') {
        // Check if liked user already liked current user (mutual like)
        const q = query(
          collection(db, 'likes'),
          where('likerId', '==', profileId),
          where('likedId', '==', currentUserId),
          where('status', '==', 'like')
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Mutual match found! Save to matches collection
          await addDoc(collection(db, 'matches'), {
            users: [currentUserId, profileId],
            timestamp: new Date()
          });

          alert('🎉 It\'s a match!');
        }
      }

      // Remove profile from UI
      setProfiles((prev) => prev.filter((profile) => profile.id !== profileId));
    } catch (error) {
      console.error(`Error handling ${action}:`, error);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>Find Your Match</h2>
      {profiles.length === 0 ? (
        <p>No profiles available</p>
      ) : (
        profiles.map((profile) => (
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
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                marginTop: '1rem',
              }}
            >
              <button onClick={() => handleAction(profile.id, 'like')}>❤️ Like</button>
              <button onClick={() => handleAction(profile.id, 'skip')}>❌ Skip</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default SwipeCards;
