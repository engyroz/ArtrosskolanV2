import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '../firebase';
import firebase from 'firebase/compat/app';
import { UserProfile } from '../types';

interface AuthContextType {
  user: firebase.User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (currentUser: firebase.User) => {
    try {
      const docRef = db.collection('users').doc(currentUser.uid);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        setUserProfile(docSnap.data() as UserProfile);
      } else {
        // Create initial profile if it doesn't exist
        const newProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          currentLevel: 1,
          subscriptionStatus: 'none',
          onboardingCompleted: false,
          displayName: currentUser.displayName || 'User',
        };
        await docRef.set(newProfile);
        setUserProfile(newProfile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};