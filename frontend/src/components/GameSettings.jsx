import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, Trash2, Plus, Save, X } from 'lucide-react';

function GameSettings() {
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [templates, setTemplates] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    const fetchGames = async () => {
        try {
            const response = await axios.get('/api/games');
            setGames(response.data);
        } catch (error) {
            console.error('Failed to fetch games:', error);
        }
    };

    const fetchTemplates = async (gameId) => {
        try {
            const response = await axios.get(`/api/games/${gameId}/templates`);
            setTemplates(response.data);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchGames();
    }, []);

    useEffect(() => {
        if (selectedGame) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchTemplates(selectedGame.id);
        } else {
            setTemplates({});
        }
    }, [selectedGame]);

    const handleCreateTemplate = () => {
        setEditingTemplate({
            name: 'New Template',
            executable: '',
            args: [],
            port: 27015,
            maxPlayers: 32,
            defaultMap: ''
        });
        setIsModalOpen(true);
    };

    const handleEditTemplate = (templateName) => {
        setEditingTemplate({
            name: templateName,
            ...templates[templateName]
        });
        setIsModalOpen(true);
    };

    const handleDeleteTemplate = async (templateName) => {
        if (!confirm(`Are you sure you want to delete template "${templateName}"?`)) return;
        try {
            await axios.delete(`/api/games/${selectedGame.id}/templates/${templateName}`);
            fetchTemplates(selectedGame.id);
        } catch (error) {
            console.error('Failed to delete template:', error);
        }
    };

    const handleSaveTemplate = async () => {
        try {
            await axios.post(`/api/games/${selectedGame.id}/templates`, editingTemplate);
            setIsModalOpen(false);
            fetchTemplates(selectedGame.id);
        } catch (error) {
            console.error('Failed to save template:', error);
        }
    };

    const updateTemplateField = (field, value) => {
        setEditingTemplate(prev => ({ ...prev, [field]: value }));
    };

    const addArg = () => {
        setEditingTemplate(prev => ({
            ...prev,
            args: [...prev.args, '']
        }));
    };

    const removeArg = (index) => {
        setEditingTemplate(prev => ({
            ...prev,
            args: prev.args.filter((_, i) => i !== index)
        }));
    };

    const updateArg = (index, value) => {
        setEditingTemplate(prev => {
            const newArgs = [...prev.args];
            newArgs[index] = value;
            return { ...prev, args: newArgs };
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-white">Game Settings</h2>
                <p className="text-gray-400">Manage server templates for each game</p>
            </div>

            {/* Game Selector */}
            <div className="bg-[#111827]/80 rounded-2xl border border-gray-800/50 shadow-xl backdrop-blur-sm p-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">Select Game</label>
                <select
                    value={selectedGame?.id || ''}
                    onChange={(e) => setSelectedGame(games.find(g => g.id === e.target.value))}
                    className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                >
                    <option value="">Select a game...</option>
                    {games.map(game => (
                        <option key={game.id} value={game.id}>
                            {game.name} ({game.templateCount} template{game.templateCount !== 1 ? 's' : ''})
                        </option>
                    ))}
                </select>
            </div>

            {/* Templates List */}
            {selectedGame && (
                <div className="bg-[#111827]/80 rounded-2xl border border-gray-800/50 shadow-xl backdrop-blur-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-800/50 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">Templates</h3>
                        <button
                            onClick={handleCreateTemplate}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-medium"
                        >
                            <Plus size={18} />
                            <span>Create New Template</span>
                        </button>
                    </div>

                    <div className="divide-y divide-gray-800/50">
                        {Object.keys(templates).map(templateName => (
                            <div key={templateName} className="p-6 flex justify-between items-center hover:bg-gray-800/30 transition-colors">
                                <div>
                                    <h4 className="text-white font-medium">{templateName}</h4>
                                    <p className="text-sm text-gray-400">
                                        {templates[templateName].maxPlayers} players • {templates[templateName].defaultMap}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditTemplate(templateName)}
                                        className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                                        title="Edit Template"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    {templateName !== 'Default' && (
                                        <button
                                            onClick={() => handleDeleteTemplate(templateName)}
                                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                            title="Delete Template"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Template Editor Modal */}
            {isModalOpen && editingTemplate && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#111827] rounded-2xl border border-gray-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-[#111827] z-10">
                            <h3 className="text-xl font-bold text-white">Edit Template</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Template Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Template Name</label>
                                <input
                                    type="text"
                                    value={editingTemplate.name}
                                    onChange={(e) => updateTemplateField('name', e.target.value)}
                                    className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    disabled={editingTemplate.name === 'Default'}
                                />
                            </div>

                            {/* Executable */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Executable</label>
                                <input
                                    type="text"
                                    value={editingTemplate.executable}
                                    onChange={(e) => updateTemplateField('executable', e.target.value)}
                                    className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none font-mono text-sm"
                                />
                            </div>

                            {/* Port & Max Players */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Port</label>
                                    <input
                                        type="number"
                                        value={editingTemplate.port}
                                        onChange={(e) => updateTemplateField('port', parseInt(e.target.value))}
                                        className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Max Players</label>
                                    <input
                                        type="number"
                                        value={editingTemplate.maxPlayers}
                                        onChange={(e) => updateTemplateField('maxPlayers', parseInt(e.target.value))}
                                        className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Default Map */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Default Map</label>
                                <input
                                    type="text"
                                    value={editingTemplate.defaultMap}
                                    onChange={(e) => updateTemplateField('defaultMap', e.target.value)}
                                    className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none font-mono text-sm"
                                />
                            </div>

                            {/* Launch Arguments */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-400">Launch Arguments</label>
                                    <button
                                        onClick={addArg}
                                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                                    >
                                        <Plus size={16} />
                                        <span>Add Argument</span>
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {editingTemplate.args.map((arg, index) => (
                                        <div key={index} className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={arg}
                                                onChange={(e) => updateArg(index, e.target.value)}
                                                className="flex-1 bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none font-mono text-sm"
                                                placeholder="Argument"
                                            />
                                            <button
                                                onClick={() => removeArg(index)}
                                                className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-800 flex justify-end space-x-3 sticky bottom-0 bg-[#111827]">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveTemplate}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center space-x-2"
                            >
                                <Save size={18} />
                                <span>Save Template</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GameSettings;
