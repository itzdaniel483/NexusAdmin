import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Download, Loader2 } from 'lucide-react';
import { io } from 'socket.io-client';

const GAMES = [
    { id: '740', name: 'Counter-Strike: Global Offensive', appId: '740' },
    { id: '4020', name: "Garry's Mod", appId: '4020' },
    { id: '232250', name: 'Team Fortress 2', appId: '232250' },
    { id: '222840', name: 'Left 4 Dead', appId: '222840' },
    { id: '1007', name: 'Half-Life 2: Deathmatch', appId: '1007' },
    { id: '232290', name: 'Day of Defeat: Source', appId: '232290' },
    { id: '17505', name: 'Zombie Panic! Source', appId: '17505' },
    { id: '237410', name: 'Insurgency', appId: '237410' },
    { id: '258550', name: 'Rust Dedicated Server', appId: '258550' },
    { id: '376030', name: 'ARK: Survival Evolved Dedicated Server', appId: '376030' },
    { id: '294420', name: '7 Days to Die Dedicated Server', appId: '294420' },
    { id: '215350', name: 'Killing Floor Dedicated Server', appId: '215350' },
    { id: '556450', name: 'The Forest Dedicated Server', appId: '556450' },
    { id: '380870', name: 'Project Zomboid Dedicated Server', appId: '380870' },
];

export default function Installer() {
    console.log('Installer component rendering...');
    const [selectedGame, setSelectedGame] = useState('');
    const [installPath, setInstallPath] = useState('C:\\Games\\');
    const [installing, setInstalling] = useState(false);
    const [logs, setLogs] = useState([]);
    const [templates, setTemplates] = useState({});
    const [selectedTemplate, setSelectedTemplate] = useState('Default');
    const [hostname, setHostname] = useState('');
    const [port, setPort] = useState('');
    const [useCache, setUseCache] = useState(false);
    const [cacheStatus, setCacheStatus] = useState({});

    const fetchTemplates = async () => {
        try {
            // In a real app, fetch from backend. For now, use defaults or mock.
            // const res = await axios.get(`/api/templates/${selectedGame}`);
            // setTemplates(res.data);
            setTemplates({ 'Default': { port: 27015, maxPlayers: 32, defaultMap: 'gm_construct' } });
            setSelectedTemplate('Default');
            setPort('');
        } catch (err) {
            console.error('Failed to fetch templates:', err);
        }
    };

    const checkCacheStatus = useCallback(async () => {
        try {
            const res = await axios.get(`/api/cache/status/${selectedGame}`);
            setCacheStatus(res.data);
        } catch (err) {
            console.error('Failed to check cache status:', err);
            setCacheStatus({});
        }
    }, [selectedGame]);

    useEffect(() => {
        if (selectedGame) {
            fetchTemplates();
            checkCacheStatus();
        }
    }, [selectedGame, checkCacheStatus]);

    const handleInstall = async () => {
        if (!selectedGame) {
            alert('Please select a game');
            return;
        }

        setInstalling(true);
        setLogs([]);

        const socket = io('http://localhost:3000');
        const logHandler = (data) => {
            setLogs(prev => [...prev, data]);
        };
        socket.on('install-log', logHandler);

        try {
            const res = await axios.post('/api/install', {
                gameId: selectedGame,
                installPath,
                template: selectedTemplate,
                hostname,
                port,
                useCache
            });

            if (res.data.success) {
                setLogs(prev => [...prev, 'Installation completed successfully!']);
                setSelectedGame('');
            } else {
                setLogs(prev => [...prev, `Error: ${res.data.error || 'Installation failed'}`]);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message;
            setLogs(prev => [...prev, `Error: ${errorMessage}`]);
        } finally {
            setInstalling(false);
            socket.off('install-log', logHandler);
            socket.disconnect();
        }
    };


    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8">
                <h2 className="text-3xl font-bold text-white mb-2">Install New Server</h2>
                <p className="text-gray-400 mb-8">Download and install a game server using SteamCMD.</p>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Select Game
                        </label>
                        <select
                            value={selectedGame}
                            onChange={(e) => setSelectedGame(e.target.value)}
                            disabled={installing}
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Choose a game...</option>
                            {GAMES.map(game => (
                                <option key={game.id} value={game.id}>
                                    {game.name} (App ID: {game.appId})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Template Selector */}
                    {selectedGame && Object.keys(templates).length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Server Template
                            </label>
                            <select
                                value={selectedTemplate}
                                onChange={(e) => setSelectedTemplate(e.target.value)}
                                disabled={installing}
                                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                            >
                                {Object.keys(templates).map(templateName => (
                                    <option key={templateName} value={templateName}>
                                        {templateName} - {templates[templateName].maxPlayers} players, {templates[templateName].defaultMap}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Choose a template configuration for your server
                            </p>
                        </div>
                    )}

                    {/* Hostname */}
                    {selectedGame && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Server Hostname
                            </label>
                            <input
                                type="text"
                                value={hostname}
                                onChange={(e) => setHostname(e.target.value)}
                                disabled={installing}
                                placeholder="My Awesome Server"
                                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                The name that will appear in the server browser
                            </p>
                        </div>
                    )}

                    {/* Port */}
                    {selectedGame && templates[selectedTemplate] && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Server Port (Optional)
                            </label>
                            <input
                                type="number"
                                value={port}
                                onChange={(e) => setPort(e.target.value)}
                                disabled={installing}
                                placeholder={`Default: ${templates[selectedTemplate]?.port || 27015}`}
                                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Leave empty to use default port ({templates[selectedTemplate]?.port || 27015})
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Installation Path
                        </label>
                        <input
                            type="text"
                            value={installPath}
                            onChange={(e) => setInstallPath(e.target.value)}
                            disabled={installing}
                            placeholder="C:\Games\"
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                            Game name will be appended to this path
                        </p>
                    </div>

                    {/* Use Cache Checkbox */}
                    {selectedGame && (
                        <div className="flex items-start gap-3 bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                            <input
                                type="checkbox"
                                id="useCache"
                                checked={useCache}
                                onChange={(e) => setUseCache(e.target.checked)}
                                disabled={installing || (cacheStatus.status !== 'ready')}
                                className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 disabled:opacity-50"
                            />
                            <div className="flex-1">
                                <label htmlFor="useCache" className="text-sm font-medium text-gray-300 cursor-pointer">
                                    Use Cached Installation (Faster)
                                </label>
                                <p className="text-xs text-gray-500 mt-1">
                                    {cacheStatus.status === 'ready' ? (
                                        <span className="text-green-400">✓ This game is cached ({cacheStatus.diskSize || 'size unknown'})</span>
                                    ) : (
                                        <span>This game is not cached. Download it first in Settings → Manage Cache for faster installs.</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleInstall}
                        disabled={installing || !selectedGame}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                    >
                        {installing ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Installing...
                            </>
                        ) : (
                            <>
                                <Download size={20} />
                                Install Server
                            </>
                        )}
                    </button>
                </div>

                {logs.length > 0 && (
                    <div className="mt-6 bg-gray-900 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Installation Log</h3>
                        <div className="font-mono text-sm text-green-400 space-y-1">
                            {logs.map((log, i) => (
                                <div key={i}>{log}</div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
