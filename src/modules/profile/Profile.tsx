import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings, TrendingUp, Grid as GridIcon, X, Edit, FileCode, Trash2 } from 'lucide-react';
import { useUi } from '../../context/UiContext';

export const Profile: React.FC = () => {
    const { games, deleteGame } = useAppContext();
    const { user: authUser } = useAuth();
    const { showConfirm, showToast } = useUi();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'created' | 'drafts' | 'trending'>('created');
    const [showSettings, setShowSettings] = useState(false);
    const [selectedGame, setSelectedGame] = useState<any>(null);

    // Derived Stats
    const publishedGames = games.filter(g => g.status === 'published' || !g.status);
    const draftGames = games.filter(g => g.status === 'draft');

    const user = {
        username: authUser?.username || 'Guest Creator',
        followers: '-',
        likes: publishedGames.reduce((acc, g) => acc + (g.likes || 0), 0),
        level: Math.floor(publishedGames.length / 5) + 1
    };

    const handleDelete = async (e: React.MouseEvent, gameId: string, gameTitle: string) => {
        e.stopPropagation(); // Prevent opening the game
        showConfirm(
            'Delete Game',
            `Are you sure you want to delete "${gameTitle}"? This cannot be undone.`,
            async () => {
                await deleteGame(gameId);
                showToast(`"${gameTitle}" deleted`, 'success');
                if (selectedGame?.id === gameId) {
                    setSelectedGame(null); // Close modal if open
                }
            }
        );
    };

    return (
        <div className="h-full w-full bg-[var(--color-bg-primary)] overflow-y-auto pb-20">

            {/* Header */}
            <div className="p-6 flex justify-between items-start">
                <h1 className="text-2xl font-bold">{user.username}</h1>
                <button onClick={() => {
                    console.log('[Debug] Settings clicked');
                    setShowSettings(true);
                }}>
                    <Settings className="text-gray-400 hover:text-white transition-colors" />
                </button>
            </div>

            {/* Stats */}
            <div className="flex justify-around items-center px-4 mb-8">
                <div className="flex flex-col items-center">
                    <span className="text-xl font-bold">{user.followers}</span>
                    <span className="text-xs text-gray-500">Followers</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xl font-bold">{user.likes}</span>
                    <span className="text-xs text-gray-500">Likes</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xl font-bold">{user.level}</span>
                    <span className="text-xs text-gray-500">Level</span>
                </div>
            </div>

            {/* Tabs / Filter */}
            <div className="flex border-b border-gray-800 mb-4 px-4 gap-6 text-sm font-medium overflow-x-auto">
                <button
                    onClick={() => setActiveTab('created')}
                    className={`flex items-center gap-2 pb-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'created'
                        ? 'border-[var(--color-accent-cyan)] text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                        }`}
                >
                    <GridIcon size={16} /> Created
                </button>
                <button
                    onClick={() => setActiveTab('drafts')}
                    className={`flex items-center gap-2 pb-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'drafts'
                        ? 'border-[var(--color-accent-cyan)] text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                        }`}
                >
                    <FileCode size={16} /> Drafts ({draftGames.length})
                </button>
                <button
                    onClick={() => setActiveTab('trending')}
                    className={`flex items-center gap-2 pb-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'trending'
                        ? 'border-[var(--color-accent-cyan)] text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                        }`}
                >
                    <TrendingUp size={16} /> Trending
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-1 px-1">
                {(activeTab === 'created' || activeTab === 'drafts') && (
                    (activeTab === 'created' ? publishedGames : draftGames).length === 0 ? (
                        <div className="col-span-3 flex-center flex-col py-10 text-gray-500">
                            <p>No games found.</p>
                            <p className="text-xs">Go to Create tab to build one!</p>
                        </div>
                    ) : (
                        (activeTab === 'created' ? publishedGames : draftGames).map((game) => (
                            <div
                                key={game.id}
                                onClick={() => {
                                    console.log('[Debug] Opening game from profile:', game.title);
                                    setSelectedGame(game);
                                }}
                                className="aspect-[3/4] bg-gray-900 rounded-sm relative overflow-hidden group border border-transparent hover:border-gray-500 cursor-pointer"
                            >
                                <div className="absolute inset-0 flex-center bg-indigo-900/30">
                                    {game.thumbnailUrl ? (
                                        <img src={game.thumbnailUrl} className="w-full h-full object-cover" alt={game.title} />
                                    ) : (
                                        <span className="text-xs text-gray-600 font-mono">CODE</span>
                                    )}
                                </div>

                                {/* Delete Button on Card (visible on hover) */}
                                <button
                                    onClick={(e) => handleDelete(e, game.id, game.title)}
                                    className="absolute top-1 right-1 p-1.5 bg-black/50 hover:bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all z-10"
                                    title="Delete Game"
                                >
                                    <Trash2 size={12} />
                                </button>

                                <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-[10px] font-bold truncate">{game.title}</p>
                                    <p className="text-[10px] text-gray-400">
                                        {game.status === 'draft' ? 'DRAFT' : `♥ ${game.likes || 0}`}
                                    </p>
                                </div>
                            </div>
                        ))
                    )
                )}
                {activeTab === 'trending' && (
                    <div className="col-span-3 flex-center flex-col py-10 text-gray-500">
                        <p>Trending games coming soon!</p>
                    </div>
                )}
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/70 flex-center z-[100]" onClick={() => setShowSettings(false)}>
                    <div className="bg-gray-900 p-8 rounded-2xl max-w-md w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowSettings(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-full"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6">Settings</h2>
                        <div className="space-y-4 text-gray-400">
                            <p>• Account Settings</p>
                            <p>• Privacy Controls</p>
                            <p>• Notifications</p>
                            <p>• Help & Support</p>
                            <p className="text-sm mt-4">Settings panel coming in production version</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Game Player Modal */}
            {selectedGame && (
                <div className="fixed inset-0 bg-black z-[100] flex-center">
                    <div className="absolute top-4 right-4 z-10 flex gap-3">
                        <button
                            onClick={(e) => handleDelete(e, selectedGame.id, selectedGame.title)}
                            className="px-4 py-2 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded-full font-bold flex items-center gap-2 transition-colors border border-red-600/50"
                        >
                            <Trash2 size={16} /> Delete
                        </button>
                        <button
                            onClick={() => {
                                setSelectedGame(null);
                                navigate('/create', { state: { game: selectedGame } });
                            }}
                            className="px-4 py-2 bg-blue-600 rounded-full font-bold hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Edit size={16} /> Edit
                        </button>
                        <button
                            onClick={() => setSelectedGame(null)}
                            className="px-4 py-2 bg-gray-800 rounded-full font-bold hover:bg-gray-700 hover:text-white text-gray-300"
                        >
                            Close
                        </button>
                    </div>
                    <iframe
                        srcDoc={selectedGame.code || '<h1 style="color: white;">No game code available</h1>'}
                        className="w-full h-full border-none"
                        title="Game Player"
                        sandbox="allow-scripts allow-modals allow-pointer-lock"
                    />
                </div>
            )}
        </div>
    );
};
