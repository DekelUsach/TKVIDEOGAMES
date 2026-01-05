import React, { useState } from 'react';
import { Search, MoreVertical, Plus, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUi } from '../../context/UiContext';

export const Header: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    // Auth Form State
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [authError, setAuthError] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(false);

    const navigate = useNavigate();
    const { user, isAuthenticated, loginAsGuest, loginWithGoogle, loginWithEmail, registerWithEmail, logout } = useAuth();
    const { showAlert, showToast } = useUi();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[Debug] Search query:', searchQuery);
        showToast(`Searching for: ${searchQuery}`, 'info');
    };

    const handleGuestLogin = () => {
        const guestUser = loginAsGuest();
        resetAndCloseModal();
        showToast(`Welcome, ${guestUser.username}! Browsing as guest.`, 'success');
        console.log('[Auth] Logged in as guest:', guestUser.username);
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError(null);
        setAuthLoading(true);

        try {
            if (authMode === 'login') {
                await loginWithEmail(email, password);
            } else {
                if (!username) throw new Error('Username is required');
                await registerWithEmail(email, password, username);
            }
            // Success
            resetAndCloseModal();
            showToast(authMode === 'login' ? 'Logged in successfully!' : 'Account created! Please check your email.', 'success');
        } catch (err: any) {
            console.error('Auth Error:', err);
            setAuthError(err.message || 'Authentication failed');
        } finally {
            setAuthLoading(false);
        }
    };

    const resetAndCloseModal = () => {
        setShowLoginModal(false);
        setAuthMode('login');
        setEmail('');
        setPassword('');
        setUsername('');
        setAuthError(null);
    };

    return (
        <>
            <header className="h-[60px] w-full border-b border-gray-800 bg-black flex items-center justify-between px-4 fixed top-0 z-50">
                {/* Left: Logo (Mobile mainly, or shared) */}
                <div className="flex items-center gap-4 w-[240px]">
                    <div className="md:hidden font-bold text-xl text-accent-cyan">Crackzone</div>
                </div>

                {/* Center: Search */}
                <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-[500px] relative">
                    <input
                        type="text"
                        placeholder="Search accounts and games"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1a1a1a] text-white rounded-full py-3 px-12 focus:outline-none focus:ring-1 focus:ring-gray-600 placeholder-gray-500 font-normal"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Search size={20} />
                    </div>
                    <button
                        type="submit"
                        className="absolute right-0 top-0 h-full w-[50px] flex-center border-l border-gray-700 rounded-r-full hover:bg-gray-800 transition-colors text-gray-400"
                    >
                        <Search size={20} />
                    </button>
                </form>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            console.log('[Debug] Upload clicked - Navigating to Create');
                            navigate('/create');
                        }}
                        className="hidden md:flex items-center gap-2 px-4 py-1.5 border border-gray-700 hover:bg-gray-900 rounded-sm transition-colors"
                    >
                        <Plus size={16} />
                        <span className="font-semibold text-sm">Upload</span>
                    </button>

                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-400">👋 {user?.username}</span>
                            <button
                                onClick={() => {
                                    console.log('[Debug] Logout clicked');
                                    logout();
                                    showToast('Logged out successfully', 'success');
                                }}
                                className="p-2 hover:bg-gray-900 rounded-full text-gray-400 hover:text-white"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                console.log('[Debug] Login clicked');
                                setShowLoginModal(true);
                            }}
                            className="px-4 py-1.5 bg-accent-cyan text-black font-bold rounded-sm hover:opacity-90 transition-opacity text-sm"
                        >
                            Log in
                        </button>
                    )}

                    <div className="relative">
                        <button
                            onClick={() => {
                                console.log('[Debug] More menu toggled');
                                setShowMoreMenu(!showMoreMenu);
                            }}
                            className="p-2 hover:bg-gray-900 rounded-full"
                        >
                            <MoreVertical size={20} />
                        </button>

                        {/* More Menu Dropdown */}
                        {showMoreMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 rounded-lg shadow-2xl border border-gray-800 py-2 z-50">
                                <button
                                    onClick={() => {
                                        console.log('[Debug] Get App clicked');
                                        showAlert('Coming Soon', 'App download coming soon!', 'info');
                                        setShowMoreMenu(false);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors text-sm"
                                >
                                    Get App
                                </button>
                                <button
                                    onClick={() => {
                                        console.log('[Debug] Language clicked');
                                        showAlert('Language', 'Currently only English is supported.', 'info');
                                        setShowMoreMenu(false);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors text-sm"
                                >
                                    Language
                                </button>
                                <button
                                    onClick={() => {
                                        console.log('[Debug] Dark Mode clicked');
                                        showToast('Already in Dark Mode!', 'info');
                                        setShowMoreMenu(false);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors text-sm"
                                >
                                    Dark Mode
                                </button>
                                <hr className="border-gray-800 my-2" />
                                <button
                                    onClick={() => {
                                        console.log('[Debug] Feedback clicked');
                                        showAlert('Feedback', 'Feedback form coming soon!', 'info');
                                        setShowMoreMenu(false);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors text-sm"
                                >
                                    Feedback and Help
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Login Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 bg-black/70 flex-center z-[100]" onClick={resetAndCloseModal}>
                    <div className="bg-gray-900 p-8 rounded-2xl max-w-md w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={resetAndCloseModal}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-full"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-2xl font-bold mb-6 text-center">
                            {authMode === 'login' ? 'Login' : 'Join Crackzone'}
                        </h2>

                        {/* Email Form */}
                        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
                            {authMode === 'register' && (
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-[#1a1a1a] text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                                />
                            )}
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#1a1a1a] text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#1a1a1a] text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                            />

                            {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}

                            <button
                                type="submit"
                                disabled={authLoading}
                                className="w-full py-3 bg-accent-cyan text-black font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {authLoading ? 'Please wait...' : (authMode === 'login' ? 'Log in' : 'Sign up')}
                            </button>
                        </form>

                        {/* Toggle Mode */}
                        <div className="text-center mb-6 text-sm">
                            <span className="text-gray-400">
                                {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                            </span>
                            <button
                                onClick={() => {
                                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                                    setAuthError(null);
                                }}
                                className="text-accent-cyan font-bold hover:underline"
                            >
                                {authMode === 'login' ? 'Sign up' : 'Log in'}
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
                            <div className="relative flex justify-center text-sm"><span className="px-2 bg-gray-900 text-gray-400">Or continue with</span></div>
                        </div>

                        {/* Social / Guest Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    loginWithGoogle();
                                    setShowLoginModal(false);
                                }}
                                className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition opacity flex items-center justify-center gap-2"
                            >
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                                Google
                            </button>
                            <button
                                onClick={handleGuestLogin}
                                className="w-full py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Continue as Guest
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
};
