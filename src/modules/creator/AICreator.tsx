import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { geminiService } from '../../services/geminiService';
import {
    Wand2,
    Sparkles,
    Save,
    Code2,
    Play,
    RefreshCw,
    ArrowLeft,
    Zap,
    Palette,
    Gamepad2,
    Maximize2,
    Minimize2,
    ImageIcon,
    Archive
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useUi } from '../../context/UiContext';
import { useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';

// Predefined styles with visual cues
const VISUAL_STYLES = [
    { id: 'neon cyberpunk', label: 'Cyberpunk', color: 'from-pink-500 to-cyan-500', icon: Zap },
    { id: 'pixel art', label: 'Pixel Art', color: 'from-purple-500 to-indigo-500', icon: Gamepad2 },
    { id: 'minimalist', label: 'Minimalist', color: 'from-gray-200 to-white', icon: Maximize2 },
    { id: 'retro arcade', label: 'Retro 80s', color: 'from-orange-500 to-red-500', icon: Play },
    { id: 'hand drawn', label: 'Hand Drawn', color: 'from-yellow-200 to-orange-100', icon: Palette },
    { id: 'custom', label: 'Custom', color: 'from-gray-600 to-gray-800', icon: Sparkles },
];

const SUGGESTIONS = [
    "A pong game where you tilt your phone to move paddles",
    "A space shooter controlled by dragging your finger",
    "A clicker game about mining crypto with haptic feedback",
    "A jump game where you tap to leap over glitches",
    "A puzzle game where you shake the device to reset",
    "A racing game with steering wheel touch controls"
];

export const AICreator: React.FC = () => {
    // State
    const [prompt, setPrompt] = useState('');
    const [selectedStyle, setSelectedStyle] = useState(VISUAL_STYLES[0].id);
    const [customStyle, setCustomStyle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'preview' | 'code'>('preview');
    const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [editingGameId, setEditingGameId] = useState<string | null>(null);
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    const [gameTitle, setGameTitle] = useState('');

    // Hooks
    const { addGame, updateGame } = useAppContext();
    const { user } = useAuth(); // Get auth context
    const { showAlert, showToast } = useUi();
    const navigate = useNavigate();
    const location = useLocation();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Initial check & Edit Mode
    useEffect(() => {
        const configured = geminiService.isConfigured();
        console.log('[AICreator] Component mounted. API Configured:', configured);
        setApiKeyConfigured(configured);

        // Check for edit mode
        if (location.state && location.state.game) {
            const gameToEdit = location.state.game;
            console.log('[AICreator] Edit mode activated for:', gameToEdit.id);
            setEditingGameId(gameToEdit.id);
            setPrompt(gameToEdit.description || gameToEdit.title);
            setGameTitle(gameToEdit.title || '');
            setGeneratedCode(gameToEdit.code);
            setThumbnailUrl(gameToEdit.thumbnailUrl || '');
            setActiveView('code'); // Start in code view for editing
        }
    }, [location.state]);

    // Handlers
    const handleGenerate = async () => {
        console.log('[AICreator] handleGenerate triggered. Prompt:', prompt);
        if (loading || !prompt.trim()) {
            console.warn('[AICreator] Generation blocked:', loading ? 'Already loading' : 'Empty prompt');
            if (!prompt.trim()) setError('Please describe your game idea first!');
            return;
        }

        setLoading(true);
        setError(null);
        setGeneratedCode(null);

        // Mix custom style if selected
        const finalStyle = selectedStyle === 'custom' ? customStyle : selectedStyle;

        try {
            console.log('[AICreator] Requesting game generation from Gemini...');
            const code = await geminiService.generateGame({
                prompt,
                difficulty: 'medium',
                style: finalStyle
            });

            console.log('[AICreator] Game generation success. Code length:', code.length);
            setGeneratedCode(code);
            setActiveView('preview');
        } catch (err: any) {
            console.error('[AICreator] Generation error:', err);
            setError(err.message || 'Magic failed. Check your connection/key.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGame = async (status: 'published' | 'draft') => {
        console.log(`[AICreator] Saving game as ${status}...`);
        if (!generatedCode) {
            console.error('[AICreator] Cannot save: No code generated');
            return;
        }

        setLoading(true);

        const newGame = {
            id: editingGameId || Date.now().toString(), // Helper ID for payload, unused by DB insert
            title: gameTitle || prompt.split(' ').slice(0, 4).join(' ') || 'Untitled Game',
            authorId: user?.id || 'guest',
            authorName: user?.username || 'Guest Creator',
            likes: 0,
            description: prompt,
            thumbnailUrl: thumbnailUrl || '', // Use user provided thumbnail
            code: generatedCode,
            createdAt: Date.now(),
            status: status
        };

        try {
            if (editingGameId) {
                console.log('[AICreator] Updating existing game:', editingGameId);
                // TODO: Update updateGame to return boolean too if needed, for now assuming void/success
                await updateGame(editingGameId, newGame);

                if (status === 'published') {
                    navigate('/profile');
                    showToast('Game published successfully!', 'success');
                } else {
                    showToast('Draft updated!', 'success');
                }
            } else {
                console.log('[AICreator] Creating new game...');
                const success = await addGame(newGame);

                if (success) {
                    if (status === 'published') {
                        console.log('[AICreator] Game published successfully, navigating...');
                        navigate('/profile');
                        showToast('Game published!', 'success');
                    } else {
                        console.log('[AICreator] Draft saved successfully');
                        showToast('Draft saved to your profile!', 'success');
                    }
                } else {
                    console.warn('[AICreator] Save failed (addGame returned false). Stay on page.');
                }
            }
        } catch (err: any) {
            console.error('[AICreator] Unexpected error saving game:', err);
            showAlert('Error', err.message || 'An unexpected error occurred while saving.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = () => handleSaveGame('published');
    const handleSaveDraft = () => handleSaveGame('draft');

    const handleRandomPrompt = async () => {
        if (isGeneratingPrompt) return;

        setIsGeneratingPrompt(true);
        console.log('[AICreator] Generating random prompt via Pollinations (Authenticated)...');

        const pollinationKey = import.meta.env.VITE_POLLINATIONS_API_KEY;

        try {
            const systemPrompt = "You are a creative game designer. Generate a short, unique, and exciting HTML5 game idea (one sentence). Output ONLY the idea itself. No introduction, no conversational filler, no quotes. Just the raw text.";
            const userPrompt = "Generate a random 1-sentence idea for a simple but addictive HTML5 game that can be coded in a single file.";

            // New 2026 Unified Authenticated Endpoint
            // Using 'nova-micro' (primary identifier)
            const url = `https://gen.pollinations.ai/text/${encodeURIComponent(userPrompt)}?model=nova-micro&system=${encodeURIComponent(systemPrompt)}&key=${pollinationKey}&seed=${Date.now()}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Pollinations Auth Error: ${response.status}`);

            const text = await response.text();

            if (!text || text.length < 5) throw new Error('Invalid response length');

            console.log('[Pollinations] Received idea:', text);
            setPrompt(text.trim().replace(/^["']|["']$/g, ''));
        } catch (err: any) {
            console.error('[AICreator] Pollinations Auth Flow failed:', err.message);
            // High-quality fallback
            const random = SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)];
            setPrompt(random);
        } finally {
            setIsGeneratingPrompt(false);
        }
    };

    // Render Components
    const renderHeader = () => (
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-3">
                {generatedCode ? (
                    <button
                        onClick={() => setGeneratedCode(null)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <ArrowLeft size={20} />
                    </button>
                ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-cyan to-blue-600 flex-center shadow-lg shadow-cyan-500/20">
                        <Wand2 size={20} className="text-white" />
                    </div>
                )}
                <div>
                    <input
                        type="text"
                        value={gameTitle}
                        onChange={(e) => setGameTitle(e.target.value)}
                        placeholder={generatedCode ? "Game Title..." : "AI Game Creator"}
                        className="bg-transparent border-none focus:outline-none text-lg font-bold bg-clip-text text-white placeholder-gray-600 block w-full"
                    />
                    {!generatedCode && (
                        <p className="text-[10px] text-gray-500">Powered by Gemini 3 Flash</p>
                    )}
                </div>
            </div>

            {generatedCode && (
                <div className="flex items-center gap-3">
                    {/* Thumbnail Input (Simple for now) */}
                    <div className="hidden md:flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1.5 border border-white/5 focus-within:border-accent-cyan/50 transition-colors">
                        <ImageIcon size={14} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Thumbnail URL..."
                            value={thumbnailUrl}
                            onChange={(e) => setThumbnailUrl(e.target.value)}
                            className="bg-transparent border-none focus:outline-none text-xs text-white w-32 placeholder-gray-500"
                        />
                    </div>

                    <button
                        onClick={handleSaveDraft}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                        title="Save as Draft"
                    >
                        <Archive size={18} />
                    </button>

                    <button
                        onClick={handlePublish}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-accent-cyan to-blue-600 text-black font-bold text-xs md:text-sm hover:shadow-lg hover:shadow-cyan-500/25 transition-all active:scale-95"
                    >
                        <Save size={16} /> <span className="hidden md:inline">Publish</span>
                    </button>
                </div>
            )}

            {!generatedCode && !apiKeyConfigured && (
                <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                    INVALID KEY
                </div>
            )}
        </div>
    );

    const renderCreationForm = () => (
        <div className="max-w-4xl mx-auto w-full p-6 animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* Hero Text */}
            <div className="text-center mb-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
                    What will you create?
                </h2>
                <p className="text-gray-400 text-lg">
                    Describe your dream game, and watch it come to life in seconds.
                </p>
            </div>

            {/* Main Input Card */}
            <div className="group relative bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-1 transition-all duration-300 hover:border-accent-cyan/50 hover:shadow-2xl hover:shadow-cyan-500/10 mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan/20 to-purple-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />

                <div className="bg-[#0A0A0A] rounded-[22px] p-6">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <Sparkles size={16} className="text-accent-cyan" />
                            Game Description
                        </label>
                        <button
                            onClick={handleRandomPrompt}
                            disabled={isGeneratingPrompt}
                            className={clsx(
                                "text-xs transition-colors flex items-center gap-1",
                                isGeneratingPrompt ? "text-gray-500 cursor-not-allowed" : "text-accent-cyan hover:text-white"
                            )}
                        >
                            <RefreshCw size={12} className={clsx(isGeneratingPrompt && "animate-spin")} />
                            {isGeneratingPrompt ? 'Thinking...' : 'Surprise me'}
                        </button>
                    </div>

                    <textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A physics-based puzzle game where you stack neon blocks to reach the moon..."
                        className="w-full bg-transparent text-lg md:text-xl text-white placeholder-gray-600 focus:outline-none min-h-[120px] resize-none"
                    />
                </div>
            </div>

            {/* Style Selector */}
            <div className="mb-10">
                <label className="text-sm font-medium text-gray-400 mb-4 block flex items-center gap-2">
                    <Palette size={16} />
                    Visual Style
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                    {VISUAL_STYLES.map((style) => (
                        <button
                            key={style.id}
                            onClick={() => setSelectedStyle(style.id)}
                            className={clsx(
                                "relative overflow-hidden p-3 rounded-xl border transition-all duration-300 text-left group h-24 flex flex-col justify-end",
                                selectedStyle === style.id
                                    ? "border-accent-cyan bg-accent-cyan/10"
                                    : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20"
                            )}
                        >
                            <div className={clsx(
                                "absolute top-0 right-0 w-12 h-12 bg-gradient-to-br opacity-20 blur-xl rounded-full translate-x-4 -translate-y-4 transition-transform group-hover:scale-150",
                                style.color
                            )} />
                            <style.icon size={20} className={clsx("mb-2", selectedStyle === style.id ? "text-white" : "text-gray-400")} />
                            <div className="font-semibold text-xs">{style.label}</div>
                        </button>
                    ))}
                </div>

                {/* Custom Style Input */}
                {selectedStyle === 'custom' && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                        <input
                            type="text"
                            value={customStyle}
                            onChange={(e) => setCustomStyle(e.target.value)}
                            placeholder="Describe your custom style (e.g., 'Matrix code rain green', 'Watercolor painting')"
                            className="w-full bg-gray-900/50 border border-accent-cyan/50 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                        />
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200">
                    <Zap size={20} className="text-red-400" />
                    <div>
                        <p className="font-bold text-sm">Generation Failed</p>
                        <p className="text-xs opacity-80">{error}</p>
                    </div>
                </div>
            )}

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={loading || !prompt || !apiKeyConfigured}
                className={clsx(
                    "w-full py-6 rounded-2xl font-bold text-xl relative overflow-hidden group transition-all duration-300",
                    loading || !prompt || !apiKeyConfigured
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                        : "text-black hover:scale-[1.01] hover:shadow-2xl hover:shadow-cyan-500/30"
                )}
            >
                {!(loading || !prompt || !apiKeyConfigured) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan via-white to-accent-cyan bg-[length:200%_auto] animate-shimmer" />
                )}

                <span className="relative flex items-center justify-center gap-3">
                    {loading ? (
                        <>
                            <RefreshCw className="animate-spin" />
                            Rendering World...
                        </>
                    ) : (
                        <>
                            <Wand2 className={clsx(prompt && apiKeyConfigured && "animate-pulse")} />
                            Generate Game
                        </>
                    )}
                </span>
            </button>

            {!apiKeyConfigured && (
                <p className="text-center text-xs text-gray-500 mt-4">
                    *Requires configured Gemini API key to function
                </p>
            )}
        </div>
    );

    const renderEditor = () => (
        <div className={clsx(
            "flex-1 flex flex-col md:flex-row overflow-hidden transition-all duration-300",
            isFullscreen ? "fixed inset-0 z-50 bg-[#050505]" : "absolute inset-0 top-[76px]"
        )}>

            {/* Split View Container */}
            <div className="flex-1 flex flex-col h-full bg-black relative">

                {/* Visual Tabs (Mobile/Desktop) */}
                <div className="flex items-center gap-1 p-2 bg-black border-b border-white/10 z-10 w-full">
                    <button
                        onClick={() => setActiveView('preview')}
                        className={clsx(
                            "flex-1 py-1.5 rounded-lg text-xs font-medium flex-center gap-2 transition-colors",
                            activeView === 'preview' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
                        )}
                    >
                        <Play size={14} /> Preview
                    </button>
                    <button
                        onClick={() => setActiveView('code')}
                        className={clsx(
                            "flex-1 py-1.5 rounded-lg text-xs font-medium flex-center gap-2 transition-colors",
                            activeView === 'code' ? "bg-blue-500/10 text-blue-400" : "text-gray-500 hover:text-gray-300"
                        )}
                    >
                        <Code2 size={14} /> Code
                    </button>

                    <div className="w-px h-4 bg-white/10 mx-2" />

                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                </div>

                <div className="flex-1 relative overflow-hidden bg-[#0d0d0d]">
                    {/* Preview Layer */}
                    <div className={clsx("absolute inset-0 w-full h-full", activeView === 'preview' ? "block z-20" : "hidden")}>
                        <iframe
                            key={generatedCode?.length} // Force re-render on code change
                            srcDoc={generatedCode || ''}
                            title="Game Preview"
                            className="w-full h-full border-none bg-white"
                            sandbox="allow-scripts allow-modals allow-pointer-lock allow-forms allow-same-origin"
                        />
                    </div>

                    {/* Code Layer */}
                    <div className={clsx("absolute inset-0 w-full h-full", activeView === 'code' ? "block z-20" : "hidden")}>
                        <textarea
                            value={generatedCode || ''}
                            onChange={(e) => setGeneratedCode(e.target.value)}
                            className="w-full h-full bg-[#1e1e1e] text-xs sm:text-base font-mono p-4 text-blue-300 resize-none focus:outline-none leading-relaxed"
                            spellCheck={false}
                            placeholder="// Code will appear here..."
                        />
                    </div>
                </div>
            </div>

            {/* Metadata Sidebar (Desktop Only) */}
            <div className="hidden md:flex w-72 h-full bg-[#0a0a0a] border-l border-white/5 flex-col p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                    <Sparkles size={14} /> Game Details
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] text-gray-500 block mb-1">DESCRIPTION</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Game description..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-accent-cyan outline-none resize-none h-24"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] text-gray-500 block mb-1">THUMBNAIL URL</label>
                        <input
                            type="text"
                            value={thumbnailUrl}
                            onChange={(e) => setThumbnailUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-accent-cyan outline-none"
                        />
                        {thumbnailUrl && (
                            <img src={thumbnailUrl} alt="Thumbnail preview" className="mt-2 w-full aspect-video object-cover rounded-lg border border-white/10" />
                        )}
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <button
                            onClick={handlePublish}
                            disabled={loading}
                            className="w-full py-3 bg-accent-cyan text-black font-bold rounded-xl text-sm flex-center gap-2 hover:bg-white transition-colors"
                        >
                            <Save size={16} /> Publish Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full w-full bg-[#050505] text-white flex flex-col relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />

            {renderHeader()}

            <div className="flex-1 overflow-y-auto relative custom-scrollbar">
                {!generatedCode ? renderCreationForm() : renderEditor()}
            </div>
        </div>
    );
};
