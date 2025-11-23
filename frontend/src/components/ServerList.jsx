import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Square, Terminal, Trash2, Settings } from 'lucide-react';

function ServerList({ onSelectServer }) {
    const [servers, setServers] = useState([]);

    useEffect(() => {
        fetchServers();
        const interval = setInterval(fetchServers, 5000);

        // Listen for status updates
        const handleStatusUpdate = ({ id, status }) => {
            setServers(prev => prev.map(s => s.id === id ? { ...s, status } : s));
        };

        // We need a way to listen to ALL server status updates, or we rely on polling.
        // Since the backend emits `server-status-${id}`, we can't easily listen to all without knowing IDs.
        // However, we can modify the backend to emit a generic 'servers-updated' event or just rely on polling.
        // Given the current backend, polling is the primary method.

        // Let's stick to polling but make sure it's robust.

        return () => clearInterval(interval);
    }, []);

    const fetchServers = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/servers');
            setServers(res.data);
        } catch (err) {
            console.error('Failed to fetch servers:', err);
        }
    };

    const deleteServer = async (id) => {
        if (!confirm('Are you sure you want to delete this server?')) return;
        try {
            await axios.delete(`http://localhost:3000/api/server/${id}`);
            fetchServers();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Your Servers</h2>
                <button onClick={fetchServers} className="text-gray-400 hover:text-white transition-colors">
                    Refresh
                </button>
            </div>

            <div className="bg-[#111827]/80 rounded-2xl border border-gray-800/50 shadow-xl backdrop-blur-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-800/50 text-gray-400 text-sm uppercase tracking-wider">
                            <th className="p-6 font-medium">Name</th>
                            <th className="p-6 font-medium">Game</th>
                            <th className="p-6 font-medium">Owner</th>
                            <th className="p-6 font-medium">Status</th>
                            <th className="p-6 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {servers.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-10 text-center text-gray-500">
                                    No servers installed yet. Go to the Installer to add one.
                                </td>
                            </tr>
                        ) : (
                            servers.map((server) => (
                                <tr key={server.id} className="hover:bg-gray-800/30 transition-colors group">
                                    <td className="p-6 font-medium text-white">{server.name || 'Unnamed Server'}</td>
                                    <td className="p-6 text-gray-400">{server.game || 'Unknown Game'}</td>
                                    <td className="p-6 text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold uppercase">
                                                {(server.owner || 'A').substring(0, 1)}
                                            </div>
                                            {server.owner || 'Admin'}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${server.status === 'running'
                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                            : 'bg-gray-700/50 text-gray-400 border border-gray-600/20'
                                            }`}>
                                            {server.status === 'running' && <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />}
                                            {server.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {server.status === 'stopped' ? (
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await axios.post('http://localhost:3000/api/server/start', { id: server.id });
                                                            fetchServers();
                                                        } catch (err) {
                                                            console.error(err);
                                                            alert('Failed to start server: ' + (err.response?.data?.error || err.message));
                                                        }
                                                    }}
                                                    className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                                                    title="Start Server"
                                                >
                                                    <Play size={18} />
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await axios.post('http://localhost:3000/api/server/stop', { id: server.id });
                                                                await axios.post('http://localhost:3000/api/server/start', { id: server.id });
                                                                fetchServers();
                                                            } catch (err) {
                                                                console.error(err);
                                                            }
                                                        }}
                                                        className="p-2 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-colors"
                                                        title="Restart Server"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await axios.post('http://localhost:3000/api/server/stop', { id: server.id });
                                                                fetchServers();
                                                            } catch (err) {
                                                                console.error(err);
                                                            }
                                                        }}
                                                        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                                        title="Stop Server"
                                                    >
                                                        <Square size={18} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => onSelectServer(server)}
                                                className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                                                title="Open Console"
                                            >
                                                <Terminal size={18} />
                                            </button>
                                            <button
                                                onClick={() => deleteServer(server.id)}
                                                className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ServerList;
