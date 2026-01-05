import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export interface User {
    id: string;
    username: string;
    avatarUrl?: string;
    isGuest: boolean;
    createdAt?: string;
}

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Check active Supabase session
        const initSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                mapSessionToUser(session.user);
            }
            // No local storage fallback for guest anymore
            setLoading(false);
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            if (session?.user) {
                mapSessionToUser(session.user);
            } else {
                setUser(null);
            }
        });

        initSession();

        return () => subscription.unsubscribe();
    }, []);

    const mapSessionToUser = (authUser: any) => {
        const metadata = authUser.user_metadata || {};
        setUser({
            id: authUser.id,
            username: metadata.username || metadata.name || authUser.email?.split('@')[0] || 'User',
            avatarUrl: metadata.avatar_url,
            isGuest: false,
            createdAt: authUser.created_at
        });
    };

    const loginWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) console.error('Google Auth Error:', error.message);
    };

    const registerWithEmail = async (email: string, password: string, username: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username,
                    name: username
                },
            },
        });
        if (error) throw error;
        return data;
    };

    const loginWithEmail = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    };

    const loginAsGuest = () => {
        // Transient guest session - no persistence
        const guestUser: User = {
            id: `guest_${Date.now()}`,
            username: `Guest_${Math.random().toString(36).substring(2, 8)}`,
            isGuest: true,
            createdAt: new Date().toISOString(),
        };

        setUser(guestUser);
        console.log('[Auth] Guest session created (Transient):', guestUser);
        return guestUser;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        console.log('[Auth] User logged out');
    };

    const isAuthenticated = !!user;

    return {
        user, // User object
        isAuthenticated, // Helper boolean
        loading, // Auth state loading
        loginWithGoogle, // New Supabase method
        loginWithEmail,
        registerWithEmail,
        loginAsGuest, // Legacy method (Transient now)
        logout, // Unified logout
    };
};
