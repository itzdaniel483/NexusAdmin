import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Download, Trash2, CheckCircle, AlertCircle, Upload } from 'lucide-react';

function PluginManager({ server }) {
    const [plugins, setPlugins] = useState([]);
    const [availablePlugins, setAvailablePlugins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [installing, setInstalling] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPlugins();
    }, [server.id]);

    const fetchPlugins = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/api/server/${server.id}/plugins`);
            setPlugins(res.data.installed || []);
            setAvailablePlugins(res.data.available || []);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch plugins:', err);
            setError('Failed to load plugins');
            setLoading(false);
        }
    };

    const handleInstall = async (pluginId) => {
        setInstalling(prev => ({ ...prev, [pluginId]: true }));
        try {
            await axios.post(`http://localhost:3000/api/server/${server.id}/plugins/install`, { pluginId });
            await fetchPlugins();
        } catch (err) {
            alert(`Failed to install plugin: ${err.response?.data?.error || err.message}`);
        } finally {
            setInstalling(prev => ({ ...prev, [pluginId]: false }));
        }
    };

    const handleUninstall = async (pluginId) => {
        if (!confirm('Are you sure you want to uninstall this plugin?')) return;

        try {
            await axios.delete(`http://localhost:3000/api/server/${server.id}/plugins/${pluginId}`);
            await fetchPlugins();
        } catch (err) {
            alert(`Failed to uninstall plugin: ${err.response?.data?.error || err.message}`);
        }
    };

    if (loading) {
        return <div className="text-gray-400">Loading plugins...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Installed Plugins */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <CheckCircle size={20} className="mr-2 text-green-400" />
                    Installed Plugins
                </h3>

                {plugins.length === 0 ? (
                    <p className="text-gray-500 text-sm">No plugins installed yet.</p>
                ) : (
                    <div className="space-y-3">
                        {plugins.map(plugin => (
                            <div key={plugin.id} className="bg-gray-950 rounded-lg p-4 border border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Package size={20} className="text-green-400" />
                                    <div>
                                        <h4 className="font-semibold text-white">{plugin.name}</h4>
                                        <p className="text-xs text-gray-400">{plugin.description}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleUninstall(plugin.id)}
                                    className="text-gray-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Uninstall"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Available Plugins */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Download size={20} className="mr-2 text-blue-400" />
                    Available Plugins
                </h3>

                {availablePlugins.length === 0 ? (
                    <p className="text-gray-500 text-sm">No additional plugins available for this game.</p>
                ) : (
                    <div className="space-y-3">
                        {availablePlugins.map(plugin => (
                            <div key={plugin.id} className="bg-gray-950 rounded-lg p-4 border border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Package size={20} className="text-gray-600" />
                                    <div>
                                        <h4 className="font-semibold text-white">{plugin.name}</h4>
                                        <p className="text-xs text-gray-400">{plugin.description}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleInstall(plugin.id)}
                                    disabled={installing[plugin.id]}
                                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${installing[plugin.id]
                                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                                        }`}
                                >
                                    <Download size={16} />
                                    {installing[plugin.id] ? 'Installing...' : 'Install'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                    <strong>Note:</strong> Plugins extend your server's functionality. Make sure to restart your server after installing or uninstalling plugins.
                </p>
            </div>
        </div>
    );
}

export default PluginManager;
