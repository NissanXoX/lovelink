// src/AuthForm.js
import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // true = login, false = signup
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Logged in successfully!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Account created!');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit} style={{ margin: '1rem auto', maxWidth: '300px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
        <p style={{ marginTop: '1rem' }}>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button type="button" onClick={() => setIsLogin(!isLogin)} style={{ border: 'none', background: 'none', color: 'blue', cursor: 'pointer' }}>
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}

export default AuthForm;
