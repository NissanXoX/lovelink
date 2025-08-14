import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import './AuthForm.css';

function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [pendingSignUpData, setPendingSignUpData] = useState(null);

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, 'profiles', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName || '',
          age: '',
          bio: '',
          gender: '',
          imageUrl: user.photoURL || '',
        });
      }

      alert('Signed in with Google!');
      setPendingSignUpData(null);
      setEmail('');
      setPassword('');
      setAge('');
      setName('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      try {
        if (pendingSignUpData) {
          if (Number(pendingSignUpData.age) < 18) {
            setError('You must be at least 18 years old to sign up.');
            return;
          }
          if (!pendingSignUpData.name.trim()) {
            setError('Name cannot be empty.');
            return;
          }

          const userCredential = await createUserWithEmailAndPassword(
            auth,
            pendingSignUpData.email,
            pendingSignUpData.password
          );

          await setDoc(doc(db, 'profiles', userCredential.user.uid), {
            name: pendingSignUpData.name.trim(),
            age: pendingSignUpData.age,
            bio: '',
            gender: '',
            imageUrl: '',
          });

          alert('Account created and logged in!');
          setPendingSignUpData(null);
          setEmail('');
          setPassword('');
          setAge('');
          setName('');
        } else {
          await signInWithEmailAndPassword(auth, email, password);
          alert('Logged in successfully!');
        }
      } catch (err) {
        setError(err.message);
      }
    } else {
      // SIGN UP flow - save name too
      if (!email || !password || !age || !name.trim()) {
        setError('Please fill in all sign up fields.');
        return;
      }

      if (Number(age) < 18) {
        setError('You must be at least 18 years old to sign up.');
        return;
      }

      // Password validation: 8+ characters, 1 uppercase, 1 lowercase, 1 special symbol
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
      if (!passwordRegex.test(password)) {
        setError(
          'Password must be at least 8 characters and include 1 uppercase letter, 1 lowercase letter, and 1 special symbol.'
        );
        return;
      }

      setPendingSignUpData({ email, password, age, name: name.trim() });
      alert('Sign up info saved. Please log in');
      setIsLogin(true);
      setError('');
      setPassword('');
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
          <>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={!isLogin}
            />
            <input
              type="number"
              placeholder="Your Age"
              value={age}
              min={18}
              onChange={(e) => setAge(e.target.value)}
              required={!isLogin}
            />
          </>
        )}
        <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
      </form>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="google-signin-btn"
        style={{ marginTop: '1rem' }}
      >
        Sign in with Google
      </button>

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
