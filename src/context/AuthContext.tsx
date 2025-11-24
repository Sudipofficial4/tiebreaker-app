import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange, signOut } from '../lib/supabase';

interface User {
    id: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen for auth state changes
        const { data } = onAuthStateChange((authenticatedUser) => {
            if (authenticatedUser) {
                setUser({
                    id: authenticatedUser.id,
                    email: authenticatedUser.email || '',
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => {
            data?.subscription?.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        await signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signOut: handleSignOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
