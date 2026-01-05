import React from 'react';
import { Compass } from 'lucide-react';

export const Explore: React.FC = () => {
    return (
        <div className="h-full w-full flex-center flex-col bg-black text-white">
            <Compass size={64} className="text-accent-cyan mb-4" />
            <h1 className="text-3xl font-bold mb-2">Explore</h1>
            <p className="text-gray-400">Discover trending games coming soon!</p>
        </div>
    );
};

export const Following: React.FC = () => {
    return (
        <div className="h-full w-full flex-center flex-col bg-black text-white">
            <h1 className="text-3xl font-bold mb-2">Following</h1>
            <p className="text-gray-400">See games from creators you follow</p>
            <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
        </div>
    );
};

export const Friends: React.FC = () => {
    return (
        <div className="h-full w-full flex-center flex-col bg-black text-white">
            <h1 className="text-3xl font-bold mb-2">Friends</h1>
            <p className="text-gray-400">Connect with friends and play together</p>
            <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
        </div>
    );
};

export const Live: React.FC = () => {
    return (
        <div className="h-full w-full flex-center flex-col bg-black text-white">
            <h1 className="text-3xl font-bold mb-2">🔴 LIVE</h1>
            <p className="text-gray-400">Watch live game development streams</p>
            <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
        </div>
    );
};
