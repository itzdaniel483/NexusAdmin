import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import io from 'socket.io-client';
import axios from 'axios';
import { Play, Square, RefreshCw, Terminal as TerminalIcon, FolderOpen, Settings, Archive, Package } from 'lucide-react';
import FileManager from './FileManager';
import CommandEditor from './CommandEditor';
import BackupManager from './BackupManager';
import UpdateManager from './UpdateManager';
import PluginManager from './PluginManager';

const socket = io('http://localhost:3000');

function ServerControl({ server }) {
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);
    const [status, setStatus] = useState('stopped');
    const [stats, setStats] = useState({ cpu: 0, memory: 0 });
    const [queryData, setQueryData] = useState(null);
    const [activeTab, setActiveTab] = useState('console');
    const [command, setCommand] = useState('');
    const [commandHistory, setCommandHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Early return if server is invalid
    if (!server) {
        return (
            <div className="text-center text-red-500 py-20">
                <p>Error: No server data provided</p>
            </div>
        );
    }

    if (!server.id) {
        return (
            <div className="text-center text-red-500 py-20">
                <p>Error: Server is missing ID property</p>
                <p className="text-sm text-gray-400 mt-2">Server object: {JSON.stringify(server)}</p>
            </div>
        );
    }

    const serverId = server.id;

    const checkStatus = async () => {
        try {
            const res = await axios.get(`/api/server/${serverId}/status`);
            setStatus(res.data.status);
        } catch (err) {
            console.error(err);
        }
    };

    const loadLogs = async () => {
        try {
            const res = await axios.get(`/api/server/${serverId}/logs`);
            if (res.data && xtermRef.current) {
                xtermRef.current.write(res.data);
            }
        } catch (err) {
            console.error('Failed to load logs:', err);
        }
    };

    useEffect(() => {
        // Initialize xterm
        const term = new Terminal({
            theme: {
                background: '#0b0f19',
                foreground: '#e2e8f0',
                cursor: '#3b82f6',
                selectionBackground: 'rgba(59, 130, 246, 0.3)',
            },
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            fontSize: 13,
            lineHeight: 1.4,
            rows: 24,
            convertEol: true, // Fixes staircase effect
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        if (terminalRef.current) {
            term.open(terminalRef.current);
            fitAddon.fit();
        }

        xtermRef.current = term;

        // Socket listeners
        socket.on(`server-log-${serverId}`, (data) => {
            term.write(data);
        });

        socket.on(`server-status-${serverId}`, (newStatus) => {
            setStatus(newStatus);
            if (newStatus === 'running') {
                term.write('\r\n\x1b[32mServer started.\x1b[0m\r\n');
            } else {
                term.write('\r\n\x1b[31mServer stopped.\x1b[0m\r\n');
                setStats({ cpu: 0, memory: 0 });
                setQueryData(null);
            }
        });

        socket.on(`server-stats-${serverId}`, (newStats) => {
            setStats(newStats);
        });

        socket.on(`server-query-${serverId}`, (data) => {
            setQueryData(data);
        });

        // Initial status check and load existing logs
        checkStatus();
        loadLogs();

        return () => {
            term.dispose();
            socket.off(`server-log-${serverId}`);
            socket.off(`server-status-${serverId}`);
            socket.off(`server-stats-${serverId}`);
            socket.off(`server-query-${serverId}`);
        };
    }, [serverId]);

    const handleStart = async () => {
        try {
            await axios.post('/api/server/start', { id: serverId });
        } catch (err) {
            xtermRef.current?.write(`\r\n\x1b[31mError starting server: ${err.response?.data?.error || err.message}\x1b[0m\r\n`);
        }
    };

    const handleStop = async () => {
        try {
            await axios.post('/api/server/stop', { id: serverId });
        } catch (err) {
            console.error(err);
        }
    };

    const handleRestart = async () => {
        await handleStop();
        setTimeout(() => handleStart(), 2000);
    };

    const handleSendCommand = async () => {
        if (!command.trim()) return;

        try {
            // Add to history
            setCommandHistory(prev => [...prev, command]);
            setHistoryIndex(-1);

            // Display command in terminal
            xtermRef.current?.write(`\r\n\x1b[36m> ${command}\x1b[0m\r\n`);

            const res = await axios.post(`http://localhost:3000/api/server/${serverId}/command`, {
                command: command
            });

            // Display response
            if (res.data.response) {
                xtermRef.current?.write(res.data.response + '\r\n');
            }

            setCommand('');
        } catch (err) {
            xtermRef.current?.write(`\x1b[31mError: ${err.response?.data?.error || err.message}\x1b[0m\r\n`);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSendCommand();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length > 0) {
                const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
                setHistoryIndex(newIndex);
                setCommand(commandHistory[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex !== -1) {
                const newIndex = historyIndex + 1;
                if (newIndex >= commandHistory.length) {
                    setHistoryIndex(-1);
                    setCommand('');
                } else {
                    setHistoryIndex(newIndex);
                    setCommand(commandHistory[newIndex]);
                }
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">{server.name}</h2>
                    <p className="text-gray-400 mb-2">{server.game}</p>

                    {/* Server Connection Details */}
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-500">IP:</span>
                            <code className="text-blue-400 bg-gray-900/50 px-2 py-1 rounded font-mono">
                                localhost:{server.port || '27015'}
                            </code>
                        </div>
                        {server.rconPassword && (
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-500">RCON:</span>
                                <code className="text-purple-400 bg-gray-900/50 px-2 py-1 rounded font-mono text-xs">
                                    {server.rconPassword}
                                </code>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    {status === 'running' && (
                        <div className="flex space-x-4 mr-4 text-sm">
                            <div className="flex flex-col items-end">
                                <span className="text-gray-400">Map</span>
                                <span className="text-white font-mono">{queryData?.map || '/'}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-gray-400">Players</span>
                                <span className="text-white font-mono">
                                    {queryData ? `${queryData.players}/${queryData.maxPlayers}` : '/'}
                                </span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-gray-400">CPU</span>
                                <span className="text-white font-mono">{stats.cpu.toFixed(1)}%</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-gray-400">RAM</span>
                                <span className="text-white font-mono">{(stats.memory / 1024 / 1024).toFixed(0)} MB</span>
                            </div>
                        </div>
                    )}
                    <span className="px-4 py-2 rounded-full bg-gray-800 text-gray-300 text-sm">
                        Status: <span className={status === 'running' ? 'text-green-400' : 'text-gray-500'}>{status}</span>
                    </span>
                    {status === 'stopped' && (
                        <button
                            onClick={handleStart}
                            className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-medium"
                        >
                            <Play size={18} />
                            <span>Start Server</span>
                        </button>
                    )}
                    {status === 'running' && (
                        <button
                            onClick={handleStop}
                            className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-medium"
                        >
                            <Square size={18} />
                            <span>Stop Server</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-gray-800">
                <button
                    onClick={() => setActiveTab('console')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${activeTab === 'console' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                    <TerminalIcon size={18} />
                    <span>Console</span>
                </button>
                <button
                    onClick={() => setActiveTab('files')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${activeTab === 'files' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                    <FolderOpen size={18} />
                    <span>Files</span>
                </button>
                <button
                    onClick={() => setActiveTab('config')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${activeTab === 'config' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                    <Settings size={18} />
                    <span>Configuration</span>
                </button>
                <button
                    onClick={() => setActiveTab('backups')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${activeTab === 'backups' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                    <Archive size={18} />
                    <span>Backups</span>
                </button>
                <button
                    onClick={() => setActiveTab('updates')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${activeTab === 'updates' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                    <RefreshCw size={18} />
                    <span>Updates</span>
                </button>
                <button
                    onClick={() => setActiveTab('plugins')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${activeTab === 'plugins' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                    <Package size={18} />
                    <span>Plugins</span>
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
                {activeTab === 'console' && (
                    <div className="bg-[#0b0f19] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl flex flex-col">
                        <div ref={terminalRef} className="h-[550px]" />
                        {status === 'running' && (
                            <div className="border-t border-gray-800 p-3 bg-gray-900/50 flex items-center space-x-2">
                                <span className="text-gray-400 text-sm">&gt;</span>
                                <input
                                    type="text"
                                    value={command}
                                    onChange={(e) => setCommand(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter command (e.g., status, changelevel, say)"
                                    className="flex-1 bg-gray-950 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none font-mono text-sm"
                                />
                                <button
                                    onClick={handleSendCommand}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                >
                                    Send
                                </button>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'files' && <FileManager serverId={serverId} />}
                {activeTab === 'config' && <CommandEditor serverId={serverId} serverData={server} />}
                {activeTab === 'backups' && <BackupManager serverId={serverId} />}
                {activeTab === 'updates' && <UpdateManager server={server} />}
                {activeTab === 'plugins' && <PluginManager server={server} />}
            </div>
        </div>
    );
}

export default ServerControl;
