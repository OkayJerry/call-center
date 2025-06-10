'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import firebase_app from '@/lib/firebase/config';

// Initialize Firebase auth instance
const auth = getAuth(firebase_app);

// Define the shape of the data that the context will provide
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

// Create the context with a default value.
// It will hold the user object and a loading state.
export const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

// Create a custom hook that allows components to easily access the context's value.
export const useAuth = () => useContext(AuthContext);

// Create the provider component. This component will wrap your entire application
// and provide the authentication state to all children.
export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged is a Firebase listener that triggers
    // whenever the user's sign-in state changes.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in.
        setUser(user);
      } else {
        // User is signed out.
        setUser(null);
      }
      // Set loading to false once we have an initial auth state.
      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
