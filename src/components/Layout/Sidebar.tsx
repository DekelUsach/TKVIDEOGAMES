import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Users, Video, PlusSquare, User } from 'lucide-react';
import clsx from 'clsx';

import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
    const { user, loginWithGoogle, logout } = useAuth();
    const navItems = [
        { icon: Home, label: 'For You', to: '/' },
        { icon: PlusSquare, label: 'Create', to: '/create' },
        { icon: User, label: 'Profile', to: '/profile' },
    ];

    const following = [
        { name: 'cyber_dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cyber' },
        { name: 'game_wizard', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wizard' },
        { name: 'pixel_art', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pixel' },
    ];

    return (
        <aside className="w-[240px] h-screen bg-black text-white flex flex-col border-r border-gray-800 overflow-y-auto hidden md:flex shrink-0 custom-scrollbar">
            {/* Logo / Brand Area (Hidden if relying on Header, but good for context) */}
            <div className="p-4 pt-6">
                <h1 className="text-2xl font-bold tracking-tighter flex items-center gap-1">
                    <span className="text-accent-cyan">Crack</span>zone
                </h1>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 px-2 py-2 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.to}
                        onClick={() => console.log(`[Debug] Navigating to: ${item.to}`)}
                        className={({ isActive }) => clsx(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-900",
                            isActive ? "text-accent-cyan font-bold" : "text-white"
                        )}
                    >
                        <item.icon size={24} />
                        <span className="text-lg">{item.label}</span>
                    </NavLink>
                ))}
            </div>

            {/* Footer / Auth */}
            <div className="p-4 border-t border-gray-800">
                {!user ? (
                    <button
                        onClick={loginWithGoogle}
                        className="w-full flex items-center justify-center gap-2 bg-white text-black py-2.5 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                    >
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                        Login
                    </button>
                ) : (
                    <div className="flex items-center gap-3">
                        <img
                            src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                            alt="User"
                            className="w-10 h-10 rounded-full border border-gray-700 bg-gray-800"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate text-white">{user.username}</p>
                            <button
                                onClick={logout}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}

                <p className="text-[10px] text-gray-700 mt-4 text-center">© 2026 Crackzone AI</p>
            </div>
        </aside>
    );
};
