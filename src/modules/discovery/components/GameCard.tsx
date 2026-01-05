import React, { useState } from 'react';
import { Heart, Share2, Bookmark, Play, MessageCircle } from 'lucide-react';
import type { Game } from '../../../types';
import { useAppContext } from '../../../context/AppContext';


interface GameCardProps {
    game: Game;
    onPlay: (game: Game) => void;
    isActive: boolean; // For auto-playing video/animation if needed
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPlay }) => {
    const { toggleLike, toggleSave, isLiked, isSaved } = useAppContext();
    const [showComments, setShowComments] = useState(false);
    const liked = isLiked(game.id);
    const saved = isSaved(game.id);
    return (
        <div className="w-full h-full relative snap-start bg-gray-900 overflow-hidden flex justify-center bg-black">
            {/* Container simulating the TikTok specific video width/ratio */}
            <div className="relative h-full aspect-[9/16] max-w-[calc(100vh*(9/16))] bg-gray-800 rounded-lg overflow-hidden shadow-2xl border border-gray-800">

                {/* Background / Preview */}
                <div className="absolute inset-0 flex-center bg-gradient-to-br from-indigo-900 to-black">
                    {game.thumbnailUrl ? (
                        <img src={game.thumbnailUrl} alt={game.title} className="w-full h-full object-cover opacity-60" />
                    ) : (
                        <div className="text-gray-500 opacity-30 animate-pulse text-4xl font-bold">
                            GAME PREVIEW
                        </div>
                    )}
                </div>

                {/* Right Side Interaction Bar (Floating) */}
                <div className="absolute right-2 bottom-20 flex flex-col items-center gap-6 z-20">

                    {/* Author Avatar */}
                    <div className="relative group cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-accent-cyan to-blue-500 p-[2px]">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${game.authorName}`} className="w-full h-full rounded-full bg-black" />
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500 rounded-full p-[2px]">
                            <span className="block w-2 h-2 bg-white rounded-full"></span>
                        </div>
                    </div>

                    {/* Like */}
                    <div
                        className="flex flex-col items-center gap-1 cursor-pointer group"
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('[GameCard] Toggling like for:', game.title);
                            toggleLike(game.id);
                        }}
                    >
                        <div className="p-3 bg-gray-800/60 rounded-full hover:bg-gray-700/60 transition-colors">
                            <Heart
                                size={28}
                                className={`drop-shadow-md transition-colors ${liked ? 'text-red-500 fill-red-500' : 'text-white'
                                    }`}
                            />
                        </div>
                        <span className="text-xs font-bold text-white drop-shadow-md">
                            {game.likes + (liked ? 1 : 0)}
                        </span>
                    </div>

                    {/* Comment */}
                    <div
                        className="flex flex-col items-center gap-1 cursor-pointer group"
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('[GameCard] Opening comments for:', game.title);
                            setShowComments(true);
                            setTimeout(() => setShowComments(false), 2000);
                        }}
                    >
                        <div className="p-3 bg-gray-800/60 rounded-full hover:bg-gray-700/60 transition-colors">
                            <MessageCircle size={28} className="text-white drop-shadow-md" />
                        </div>
                        <span className="text-xs font-bold text-white drop-shadow-md">234</span>
                    </div>

                    {/* Save */}
                    <div
                        className="flex flex-col items-center gap-1 cursor-pointer group"
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('[GameCard] Toggling save for:', game.title);
                            toggleSave(game.id);
                        }}
                    >
                        <div className="p-3 bg-gray-800/60 rounded-full hover:bg-gray-700/60 transition-colors">
                            <Bookmark
                                size={28}
                                className={`drop-shadow-md transition-colors ${saved ? 'text-accent-lime fill-accent-lime' : 'text-white'
                                    }`}
                            />
                        </div>
                        <span className="text-xs font-bold text-white drop-shadow-md">
                            {saved ? 'Saved' : 'Save'}
                        </span>
                    </div>

                    {/* Share */}
                    <div
                        className="flex flex-col items-center gap-1 cursor-pointer group"
                        onClick={async (e) => {
                            e.stopPropagation();
                            console.log('[GameCard] Sharing game:', game.title);
                            const url = `${window.location.origin}/game/${game.id}`;
                            try {
                                await navigator.clipboard.writeText(url);
                                console.log('[GameCard] Link copied to clipboard');
                                alert(`Link copied to clipboard!`);
                            } catch (err) {
                                console.error('[GameCard] Share failed:', err);
                                alert(`Share: ${game.title}`);
                            }
                        }}
                    >
                        <div className="p-3 bg-gray-800/60 rounded-full hover:bg-gray-700/60 transition-colors">
                            <Share2 size={28} className="text-white drop-shadow-md group-hover:text-accent-cyan" />
                        </div>
                        <span className="text-xs font-bold text-white drop-shadow-md">Share</span>
                    </div>
                </div>
            </div>

            {/* Bottom Info Overlay */}
            <div className="absolute bottom-4 left-4 right-16 z-10 text-shadow-sm select-none pointer-events-none">
                <h3 className="font-bold text-white mb-1 shadow-black drop-shadow-md">@{game.authorName}</h3>
                <p className="text-sm text-white/90 leading-tight line-clamp-2 drop-shadow-md mb-2">{game.description} <span className="font-bold">#crackzone #ai #game</span></p>

                <div className="flex items-center gap-2 mb-3">
                    <div className="px-2 py-1 bg-gray-800/60 backdrop-blur-sm rounded text-xs text-white flex items-center gap-1">
                        ♫ Original Sound - {game.authorName}
                    </div>
                </div>
            </div>

            {/* Play Overlay (Big Center Button) */}
            <div className="absolute inset-0 flex-center z-0 group hover:bg-black/20 transition-colors cursor-pointer" onClick={() => onPlay(game)}>
                <Play size={64} fill="white" className="text-white opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-2xl" />
            </div>

            {/* Comment Toast */}
            {showComments && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white z-30 animate-in fade-in slide-in-from-top-2">
                    Comments coming soon!
                </div>
            )}

        </div>
    );
};
