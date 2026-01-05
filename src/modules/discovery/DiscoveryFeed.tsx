import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { GameCard } from './components/GameCard';
import type { Game } from '../../types';

import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';

export const DiscoveryFeed: React.FC = () => {
    const { games } = useAppContext();
    const [activeGame, setActiveGame] = useState<Game | null>(null);

    // Filter published games (or legacy ones without status)
    const publishedGames = games.filter(g => g.status === 'published' || !g.status);

    const { user } = useAuth();

    const handlePlay = async (game: Game) => {
        console.log('[DiscoveryFeed] Opening game:', game.title, 'ID:', game.id);
        setActiveGame(game);

        // Record play in Supabase (fire and forget)
        const { error } = await supabase
            .from('plays')
            .insert({
                game_id: game.id,
                user_id: user?.id || null
            });

        if (error) console.error('[Supabase] Error recording play:', error);
    };

    if (publishedGames.length === 0) {
        return (
            <div className="h-full w-full flex-center text-gray-500 bg-black flex-col gap-4">
                <p>No games yet.</p>
                <p className="text-xs">Be the first to create one!</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full snap-container bg-black">
            {publishedGames.map((game) => (
                <div key={game.id} className="snap-item w-full flex justify-center items-center">
                    <GameCard
                        game={game}
                        onPlay={handlePlay}
                        isActive={false}
                    />
                </div>
            ))}

            {/* Loading / Infinite Scroll Sentinel */}
            <div className="h-20 snap-end flex-center text-gray-500">
                Loading more...
            </div>

            {activeGame && createPortal(
                <div className="fixed inset-0 z-[100] bg-black text-white flex-center">
                    <div className="w-full h-full relative">
                        <button
                            onClick={() => setActiveGame(null)}
                            className="absolute top-4 right-4 z-10 px-4 py-2 bg-red-600 rounded-full font-bold hover:bg-red-700"
                        >
                            Close
                        </button>
                        <iframe
                            srcDoc={activeGame.code || '<h1>No Code Generated yet (Mock Game)</h1>'}
                            className="w-full h-full border-none"
                            title="Game Play"
                        />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
