import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Folder, File, ChevronRight, Save, X, FileText, Code, Settings as SettingsIcon } from 'lucide-react';

function FileManager({ serverId }) {
    const [currentPath, setCurrentPath] = useState('');
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadDirectory(currentPath);
    }, [currentPath, serverId]);

    const loadDirectory = async (path) => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:3000/api/server/${serverId}/files`, {
                params: { path }
            });
            setFiles(res.data.files);
        } catch (err) {
            console.error('Failed to load directory:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadFile = async (fileName) => {
        const filePath = currentPath ? `${currentPath}/${fileName}` : fileName;
        try {
            const res = await axios.get(`http://localhost:3000/api/server/${serverId}/file`, {
                params: { path: filePath }
            });
            setFileContent(res.data.content);
            setSelectedFile(filePath);
        } catch (err) {
            alert(`Error: ${err.response?.data?.error || err.message}`);
        }
    };

    const saveFile = async () => {
        if (!selectedFile) return;
        setSaving(true);
        try {
            await axios.post(`http://localhost:3000/api/server/${serverId}/file`, {
                path: selectedFile,
                content: fileContent
            });
            alert('File saved! Backup created.');
        } catch (err) {
            alert(`Save failed: ${err.response?.data?.error || err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const navigateToFolder = (folderName) => {
        setSelectedFile(null);
        const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
        setCurrentPath(newPath);
    };

    const navigateUp = () => {
        setSelectedFile(null);
        const pathParts = currentPath.split('/');
        pathParts.pop();
        setCurrentPath(pathParts.join('/'));
    };

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (['cfg', 'ini', 'txt', 'json', 'xml'].includes(ext)) {
            return <FileText size={16} className="text-blue-400" />;
        }
        if (['lua', 'js', 'py'].includes(ext)) {
            return <Code size={16} className="text-green-400" />;
        }
        return <File size={16} className="text-gray-400" />;
    };

    const breadcrumbs = currentPath ? currentPath.split('/') : [];

    return (
        <div className="h-[600px] flex gap-4">
            {/* File Browser */}
            <div className="w-1/3 bg-gray-900/50 rounded-xl border border-gray-700/30 flex flex-col">
                {/* Breadcrumb */}
                <div className="p-4 border-b border-gray-700/30 flex items-center space-x-2 text-sm">
                    <button
                        onClick={() => setCurrentPath('')}
                        className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                        Root
                    </button>
                    {breadcrumbs.map((part, idx) => (
                        <React.Fragment key={idx}>
                            <ChevronRight size={14} className="text-gray-600" />
                            <button
                                onClick={() => setCurrentPath(breadcrumbs.slice(0, idx + 1).join('/'))}
                                className="text-blue-400 hover:text-blue-300"
                            >
                                {part}
                            </button>
                        </React.Fragment>
                    ))}
                </div>

                {/* File List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {currentPath && (
                        <button
                            onClick={navigateUp}
                            className="w-full text-left px-3 py-2 hover:bg-gray-800/50 rounded-lg flex items-center space-x-2 text-gray-400 text-sm mb-1"
                        >
                            <Folder size={16} />
                            <span>..</span>
                        </button>
                    )}
                    {loading ? (
                        <div className="text-center text-gray-500 py-8">Loading...</div>
                    ) : (
                        <>
                            {files.filter(f => f.isDirectory).map(file => (
                                <button
                                    key={file.name}
                                    onClick={() => navigateToFolder(file.name)}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-800/50 rounded-lg flex items-center space-x-2 text-white text-sm"
                                >
                                    <Folder size={16} className="text-yellow-500" />
                                    <span>{file.name}</span>
                                </button>
                            ))}
                            {files.filter(f => !f.isDirectory).map(file => (
                                <button
                                    key={file.name}
                                    onClick={() => loadFile(file.name)}
                                    className={`w-full text-left px-3 py-2 hover:bg-gray-800/50 rounded-lg flex items-center space-x-2 text-sm ${selectedFile === (currentPath ? `${currentPath}/${file.name}` : file.name)
                                            ? 'bg-blue-600/20 text-blue-300'
                                            : 'text-gray-300'
                                        }`}
                                >
                                    {getFileIcon(file.name)}
                                    <span className="flex-1">{file.name}</span>
                                    <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)}KB</span>
                                </button>
                            ))}
                        </>
                    )}
                </div>
            </div>

            {/* File Editor */}
            <div className="flex-1 bg-gray-900/50 rounded-xl border border-gray-700/30 flex flex-col">
                {selectedFile ? (
                    <>
                        <div className="p-4 border-b border-gray-700/30 flex items-center justify-between">
                            <span className="text-white font-medium flex items-center space-x-2">
                                {getFileIcon(selectedFile)}
                                <span>{selectedFile.split('/').pop()}</span>
                            </span>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={saveFile}
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
                                >
                                    <Save size={16} />
                                    <span>{saving ? 'Saving...' : 'Save'}</span>
                                </button>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="text-gray-400 hover:text-white p-2"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        <textarea
                            value={fileContent}
                            onChange={(e) => setFileContent(e.target.value)}
                            className="flex-1 bg-gray-950 text-gray-100 p-4 font-mono text-sm resize-none focus:outline-none"
                            spellCheck={false}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <FileText size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Select a file to edit</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FileManager;
