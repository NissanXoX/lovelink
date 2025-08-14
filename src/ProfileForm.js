import { useState, useEffect } from 'react';
import { db, auth, storage } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function ProfileForm() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [likes, setLikes] = useState('');
  const [uploading, setUploading] = useState(false);

  const userId = auth.currentUser.uid;

  useEffect(() => {
    const fetchProfile = async () => {
      const profileRef = doc(db, 'profiles', userId);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        setProfile(data);
        setName(data.name || '');
        setAge(data.age || '');
        setBio(data.bio || '');
        setGender(data.gender || '');
        setImageUrl(data.imageUrl || '');
        setHobbies(Array.isArray(data.hobbies) ? data.hobbies.join(', ') : '');
        setLikes(Array.isArray(data.likes) ? data.likes.join(', ') : '');
      }
    };
    fetchProfile();
  }, [userId]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const imageRef = ref(storage, `profileImages/${userId}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      setImageUrl(url);
      alert('Image uploaded!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image.');
    }

    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for required fields except imageUrl
    if (
      !name.trim() ||
      !age ||
      !bio.trim() ||
      !gender ||
      !hobbies.trim() ||
      !likes.trim()
    ) {
      alert('Please fill in all fields except image.');
      return;
    }

    if (Number(age) < 18) {
      alert('You must be at least 18 years old.');
      return;
    }

    try {
      await setDoc(doc(db, 'profiles', userId), {
        name: name.trim(),
        age,
        bio: bio.trim(),
        gender,
        imageUrl,
        hobbies: hobbies.split(',').map(h => h.trim()).filter(h => h),
        likes: likes.split(',').map(l => l.trim()).filter(l => l),
      });
      setProfile({
        name: name.trim(),
        age,
        bio: bio.trim(),
        gender,
        imageUrl,
        hobbies: hobbies.split(',').map(h => h.trim()).filter(h => h),
        likes: likes.split(',').map(l => l.trim()).filter(l => l),
      });
      setEditing(false);
      alert('Profile saved!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile.');
    }
  };

  if (!profile || editing) {
    return (
      <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: 'auto', textAlign: 'center' }}>
        <h2>{profile ? 'Edit Your Profile' : 'Create Your Profile'}</h2>

        {/* Image preview */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="imageUpload" style={{ cursor: 'pointer' }}>
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                backgroundColor: '#eee',
                backgroundImage: `url(${imageUrl || 'https://via.placeholder.com/120?text=No+Image'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                margin: 'auto',
                border: '2px solid #ff4f81',
              }}
            />
            <div style={{ color: '#ff4f81', marginTop: 8 }}>
              {uploading ? 'Uploading...' : 'Click to upload image'}
            </div>
          </label>
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            disabled={uploading}
          />
        </div>

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
          min={18}
          onChange={(e) => setAge(e.target.value)}
          style={{ marginBottom: '1rem', width: '100%', padding: '0.5rem' }}
        />

        <select
          value={gender}
          required
          onChange={(e) => setGender(e.target.value)}
          style={{ marginBottom: '1rem', width: '100%', padding: '0.5rem' }}
        >
          <option value="" disabled>
            Select Gender
          </option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <textarea
          placeholder="Your bio"
          value={bio}
          required
          onChange={(e) => setBio(e.target.value)}
          style={{ marginBottom: '1rem', width: '100%', padding: '0.5rem' }}
        />

        <input
          type="text"
          placeholder="Hobbies (comma separated)"
          value={hobbies}
          required
          onChange={(e) => setHobbies(e.target.value)}
          style={{ marginBottom: '1rem', width: '100%', padding: '0.5rem' }}
        />

        <input
          type="text"
          placeholder="Likes (comma separated)"
          value={likes}
          required
          onChange={(e) => setLikes(e.target.value)}
          style={{ marginBottom: '1rem', width: '100%', padding: '0.5rem' }}
        />

        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading Image...' : profile ? 'Update Profile' : 'Save Profile'}
        </button>
      </form>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: 'auto', textAlign: 'center' }}>
      <h2>Your Profile</h2>

      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          backgroundColor: '#eee',
          backgroundImage: `url(${profile.imageUrl || 'https://via.placeholder.com/120?text=No+Image'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          margin: 'auto',
          border: '2px solid #ff4f81',
          marginBottom: '1rem',
        }}
      />

      <p>
        <strong>Name:</strong> {profile.name}
      </p>
      <p>
        <strong>Age:</strong> {profile.age}
      </p>
      <p>
        <strong>Gender:</strong> {profile.gender}
      </p>
      <p>
        <strong>Bio:</strong> {profile.bio}
      </p>
      <p>
        <strong>Hobbies:</strong> {profile.hobbies ? profile.hobbies.join(', ') : ''}
      </p>
      <p>
        <strong>Likes:</strong> {profile.likes ? profile.likes.join(', ') : ''}
      </p>

      <button onClick={() => setEditing(true)}>✏️ Edit Profile</button>
    </div>
  );
}

export default ProfileForm;
