import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useUi } from './UiContext';
import { supabase } from '../services/supabaseClient';

import type { Game } from '../types';

interface AppState {
    // Games
    games: Game[];
    addGame: (game: Game) => Promise<boolean>;
    updateGame: (id: string, updates: Partial<Game>) => Promise<void>;
    deleteGame: (id: string) => Promise<void>;

    // Interactions
    likedGames: Set<string>;
    savedGames: Set<string>;
    toggleLike: (gameId: string) => void;
    toggleSave: (gameId: string) => void;
    isLiked: (gameId: string) => boolean;
    isSaved: (gameId: string) => boolean;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { showAlert, showToast } = useUi();

    // In-memory state only (fetched from DB)
    const [likedGames, setLikedGames] = useState<Set<string>>(new Set());
    const [savedGames, setSavedGames] = useState<Set<string>>(new Set());
    const [games, setGames] = useState<Game[]>([]);

    // Sync User Data (Likes) on Login
    useEffect(() => {
        if (!user || user.isGuest) {
            setLikedGames(new Set());
            setSavedGames(new Set());
            return;
        }

        const fetchUserData = async () => {
            console.log('[AppContext] Fetching user data from Supabase...');

            // Fetch Likes
            const { data: likesData } = await supabase
                .from('likes')
                .select('game_id')
                .eq('user_id', user.id);

            if (likesData) {
                const likedIds = likesData.map((l: any) => l.game_id);
                setLikedGames(new Set(likedIds));
            }
        };

        fetchUserData();
    }, [user]);

    const toggleLike = async (gameId: string) => {
        if (!user || user.isGuest) {
            showToast('Please login to like games', 'info');
            return;
        }

        console.log(`[AppContext] Toggling like for game: ${gameId}`);

        // Optimistic update
        const previouslyLiked = likedGames.has(gameId);
        setLikedGames(prev => {
            const newSet = new Set(prev);
            previouslyLiked ? newSet.delete(gameId) : newSet.add(gameId);
            return newSet;
        });

        if (previouslyLiked) {
            // Unlike
            const { error } = await supabase
                .from('likes')
                .delete()
                .eq('user_id', user.id)
                .eq('game_id', gameId);

            if (error) console.error('[Supabase] Error unliking:', error);
        } else {
            // Like
            const { error } = await supabase
                .from('likes')
                .insert({ user_id: user.id, game_id: gameId });

            if (error) console.error('[Supabase] Error liking:', error);
        }
    };

    const toggleSave = (gameId: string) => {
        if (!user || user.isGuest) {
            showToast('Please login to save games', 'info');
            return;
        }
        // TODO: Implement 'saves' table in Supabase
        console.log(`[AppContext] Toggling save for game: ${gameId}`);
        setSavedGames(prev => {
            const newSet = new Set(prev);
            if (newSet.has(gameId)) {
                newSet.delete(gameId);
                showToast('Removed from saved', 'info');
            } else {
                newSet.add(gameId);
                showToast('Saved to your collection!', 'success');
            }
            return newSet;
        });
    };

    const isLiked = (gameId: string) => likedGames.has(gameId);
    const isSaved = (gameId: string) => savedGames.has(gameId);

    // Sync Games with Supabase
    useEffect(() => {
        const fetchGames = async () => {
            console.log('[AppContext] Fetching games from Supabase...');
            const { data, error } = await supabase
                .from('games')
                .select('*, profiles(username)')
                .order('created_at', { ascending: false });

            if (data) {
                const mappedGames: Game[] = data.map((g: any) => ({
                    id: g.id,
                    title: g.title,
                    description: g.description,
                    authorId: g.author_id,
                    authorName: g.profiles?.username || 'Unknown',
                    thumbnailUrl: g.thumbnail_url,
                    code: g.code,
                    likes: g.likes_count,
                    createdAt: new Date(g.created_at).getTime(),
                    status: g.status as 'published' | 'draft'
                }));

                setGames(mappedGames);
            }
            if (error) console.error('[Supabase] Error fetching games:', error);
        };

        fetchGames();
    }, [user]);

    const addGame = async (game: Game): Promise<boolean> => {
        if (!user) {
            showToast('Please login to save your game', 'info');
            return false;
        }

        if (user.isGuest) {
            showAlert('Guest Account', 'Guest accounts cannot save to the cloud. Please create an account via the Login button.', 'warning');
            return false;
        }

        console.log('[AppContext] Adding game to Supabase:', game.title);

        const payload = {
            title: game.title,
            description: game.description,
            code: game.code,
            thumbnail_url: game.thumbnailUrl,
            author_id: user.id,
            status: game.status,
            created_at: new Date(game.createdAt).toISOString(),
            published_at: game.status === 'published' ? new Date().toISOString() : null
        };

        const { data, error } = await supabase
            .from('games')
            .insert(payload)
            .select()
            .single();

        if (error) {
            console.error('[Supabase] Add game error:', error);
            showAlert('Save Failed', `Failed to save game: ${error.message}`, 'error');
            return false;
        }

        if (data) {
            console.log('[AppContext] Game saved successfully with ID:', data.id);
            // Construct the complete game object with the real ID from DB
            const newGame: Game = {
                ...game,
                id: data.id,
                authorName: user.username // Ensure author name is correct locally
            };
            setGames(prev => [newGame, ...prev]);
            return true;
        }

        return false;
    };

    const updateGame = async (id: string, updates: Partial<Game>) => {
        if (!user || user.isGuest) return;

        setGames(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));

        const dbUpdates: any = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.description) dbUpdates.description = updates.description;
        if (updates.code) dbUpdates.code = updates.code;
        if (updates.thumbnailUrl) dbUpdates.thumbnail_url = updates.thumbnailUrl;
        if (updates.status) dbUpdates.status = updates.status;

        const { error } = await supabase.from('games').update(dbUpdates).eq('id', id);
        if (error) console.error('[Supabase] Update game error:', error);
    };

    const deleteGame = async (id: string) => {
        if (!user || user.isGuest) return;

        setGames(prev => prev.filter(g => g.id !== id));

        const { error } = await supabase.from('games').delete().eq('id', id);
        if (error) console.error('[Supabase] Delete game error:', error);
    };

    return (
        <AppContext.Provider value={{
            games, addGame, updateGame, deleteGame,
            likedGames, savedGames, toggleLike, toggleSave, isLiked, isSaved
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppProvider');
    }
    return context;
};
