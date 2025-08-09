// src/AuthForm.js
import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebase';
import { setDoc, doc } from 'firebase/firestore';
import './AuthForm.css'; // Your CSS file for styles

function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [isLogin, setIsLogin] = useState(true); // true = login, false = signup
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && Number(age) < 18) {
      setError('You must be at least 18 years old to sign up.');
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Logged in successfully!');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Create empty profile doc with age saved
        await setDoc(doc(db, 'profiles', userCredential.user.uid), {
          name: '',
          age,
          bio: '',
          gender: '',
          imageUrl: '',
        });

        alert('Account created!');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="signup-container">
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {!isLogin && (
          <input
            type="number"
            placeholder="Your Age"
            value={age}
            min={18}
            onChange={(e) => setAge(e.target.value)}
            required={!isLogin}
          />
        )}
        <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
      </form>
      <p className="bottom-text">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="toggle-btn"
        >
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </p>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default AuthForm;
