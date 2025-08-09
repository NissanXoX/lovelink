import React, { useEffect, useState, useRef } from 'react';
import { db, auth } from './firebase';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';

const SWIPE_THRESHOLD = 100; // px drag distance to trigger swipe

function SwipeCards() {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [swipeDirection, setSwipeDirection] = useState(null); // 'left' | 'right' | null
  const [matchProfile, setMatchProfile] = useState(null); // matched profile to show overlay
  const cardRef = useRef(null);

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

  // Close match notification after 3 seconds
  useEffect(() => {
    if (matchProfile) {
      const timer = setTimeout(() => setMatchProfile(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [matchProfile]);

  // Handle drag start
  const handlePointerDown = (e) => {
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setSwipeDirection(null);
    if (e.pointerType === 'touch') e.currentTarget.setPointerCapture(e.pointerId);
  };

  // Handle drag move
  const handlePointerMove = (e) => {
    if (!dragging) return;
    const x = e.clientX - dragStart.x;
    const y = e.clientY - dragStart.y;
    setDragOffset({ x, y });

    if (x > SWIPE_THRESHOLD) setSwipeDirection('right');
    else if (x < -SWIPE_THRESHOLD) setSwipeDirection('left');
    else setSwipeDirection(null);
  };

  // Animate card out (basic)
  const animateSwipe = (direction) => {
    return new Promise((resolve) => {
      if (!cardRef.current) return resolve();
      const card = cardRef.current;
      card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
      card.style.transform = `translateX(${direction === 'right' ? 1000 : -1000}px) rotate(${direction === 'right' ? 45 : -45}deg)`;
      card.style.opacity = '0';

      setTimeout(() => {
        card.style.transition = '';
        card.style.transform = '';
        card.style.opacity = '';
        resolve();
      }, 300);
    });
  };

  // Handle drag end (swipe)
  const handlePointerUp = async () => {
    if (!dragging) return;
    setDragging(false);

    if (swipeDirection) {
      await animateSwipe(swipeDirection);
      await handleAction(profiles[currentIndex].id, swipeDirection === 'right' ? 'like' : 'skip');
      setDragOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
      setCurrentIndex((i) => i + 1);
    } else {
      setDragOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
    }
  };

  // Handle like/skip Firestore logic
  const handleAction = async (profileId, action) => {
    try {
      const currentUserId = auth.currentUser.uid;

      await addDoc(collection(db, 'likes'), {
        likerId: currentUserId,
        likedId: profileId,
        status: action,
        timestamp: new Date(),
      });

      if (action === 'like') {
        const q = query(
          collection(db, 'likes'),
          where('likerId', '==', profileId),
          where('likedId', '==', currentUserId),
          where('status', '==', 'like')
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          await addDoc(collection(db, 'matches'), {
            users: [currentUserId, profileId],
            timestamp: new Date(),
          });

          // Show match notification overlay
          const matchedProfile = profiles.find((p) => p.id === profileId);
          setMatchProfile(matchedProfile);
        }
      }
    } catch (error) {
      console.error(`Error handling ${action}:`, error);
    }
  };

  if (profiles.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Find Your Match</h2>
        <p>No profiles available</p>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Find Your Match</h2>
        <p>No more profiles to show!</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: 360, height: 480, margin: '2rem auto' }}>
      {profiles
        .slice(currentIndex, currentIndex + 3)
        .map((profile, i) => {
          const isTop = i === 0;
          const offsetY = i * 10;
          const scale = 1 - i * 0.05;
          const zIndex = 10 - i;

          const style = {
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: 20,
            boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
            backgroundColor: '#fff',
            backgroundImage: `url(${profile.imageUrl || 'https://via.placeholder.com/360x480?text=No+Image'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            userSelect: 'none',
            cursor: isTop ? 'grab' : 'default',
            top: offsetY,
            left: 0,
            transform: `scale(${scale})`,
            zIndex,
            transition: dragging && isTop ? 'none' : 'transform 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            color: '#fff',
            padding: '20px',
            boxSizing: 'border-box',
          };

          if (isTop) {
            style.transform = `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg) scale(${scale})`;
            style.transition = dragging ? 'none' : 'transform 0.3s ease';
          }

          return (
            <div
              key={profile.id}
              ref={isTop ? cardRef : null}
              style={style}
              onPointerDown={isTop ? handlePointerDown : null}
              onPointerMove={isTop ? handlePointerMove : null}
              onPointerUp={isTop ? handlePointerUp : null}
              onPointerCancel={isTop ? handlePointerUp : null}
              onPointerLeave={isTop ? handlePointerUp : null}
            >
              {isTop && swipeDirection === 'right' && (
                <div
                  style={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    padding: '8px 16px',
                    border: '4px solid #4caf50',
                    color: '#4caf50',
                    fontWeight: '800',
                    fontSize: 32,
                    borderRadius: 8,
                    userSelect: 'none',
                    transform: 'rotate(-15deg)',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    zIndex: 100,
                  }}
                >
                  LIKE ❤️
                </div>
              )}

              {isTop && swipeDirection === 'left' && (
                <div
                  style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    padding: '8px 16px',
                    border: '4px solid #ff3b30',
                    color: '#ff3b30',
                    fontWeight: '800',
                    fontSize: 32,
                    borderRadius: 8,
                    userSelect: 'none',
                    transform: 'rotate(15deg)',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    zIndex: 100,
                  }}
                >
                  NOPE ❌
                </div>
              )}

              <div
                style={{
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  padding: '12px',
                  borderRadius: '12px',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#ff4f81' }}>
                  {profile.name}, {profile.age}
                </h2>
                <p
                  style={{
                    marginTop: 6,
                    fontSize: '1rem',
                    color: 'white',
                    maxHeight: 60,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={profile.bio}
                >
                  {profile.bio || 'No bio available.'}
                </p>
              </div>
            </div>
          );
        })}

      {/* Match notification overlay */}
      {matchProfile && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#ff4f81',
            fontSize: '2rem',
            fontWeight: 'bold',
            borderRadius: 20,
            zIndex: 1000,
            animation: 'fadeInScale 0.5s ease',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 20 }}>💖</div>
          <div>It's a Match!</div>
          <div style={{ marginTop: 10, fontSize: '1.5rem' }}>
            You matched with <strong>{matchProfile.name}</strong>!
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default SwipeCards;
