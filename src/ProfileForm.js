// src/ProfileForm.js
import { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function ProfileForm() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const userId = auth.currentUser.uid;

  // Load profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const profileRef = doc(db, 'profiles', userId);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        setProfile(data);
        setName(data.name);
        setAge(data.age);
        setBio(data.bio);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await setDoc(doc(db, 'profiles', userId), {
        name,
        age,
        bio,
        imageUrl: profile?.imageUrl || '', // placeholder for now
      });
      setProfile({ name, age, bio });
      setEditing(false);
      alert('Profile saved!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile.');
    }

    setLoading(false);
  };

  if (!profile || editing) {
    return (
      <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: 'auto' }}>
        <h2>{profile ? 'Edit Your Profile' : 'Create Your Profile'}</h2>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
          style={{ marginBottom: '1rem', width: '100%', padding: '0.5rem' }}
        />
        <input
          type="number"
          placeholder="Your age"
          value={age}
          required
          onChange={(e) => setAge(e.target.value)}
          style={{ marginBottom: '1rem', width: '100%', padding: '0.5rem' }}
        />
        <textarea
          placeholder="Your bio"
          value={bio}
          required
          onChange={(e) => setBio(e.target.value)}
          style={{ marginBottom: '1rem', width: '100%', padding: '0.5rem' }}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : profile ? 'Update Profile' : 'Save Profile'}
        </button>
      </form>
    );
  }

  // Show profile view with edit button
  return (
    <div style={{ maxWidth: 400, margin: 'auto' }}>
      <h2>Your Profile</h2>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Age:</strong> {profile.age}</p>
      <p><strong>Bio:</strong> {profile.bio}</p>
      <button onClick={() => setEditing(true)}>✏️ Edit Profile</button>
    </div>
  );
}

export default ProfileForm;
