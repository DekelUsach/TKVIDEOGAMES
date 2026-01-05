import React, { createContext, useContext, type ReactNode } from 'react';
import { useAuth as useAuthHook, type User } from '../hooks/useAuth';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    loginWithGoogle: () => Promise<void>;
    loginWithEmail: (email: string, password: string) => Promise<any>;
    registerWithEmail: (email: string, password: string, username: string) => Promise<any>;
    loginAsGuest: () => User;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const auth = useAuthHook();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
