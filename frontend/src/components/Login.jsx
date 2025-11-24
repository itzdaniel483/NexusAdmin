import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Lock, AlertCircle, Shield } from 'lucide-react';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [authMode, setAuthMode] = useState('local');
    const [loadingSettings, setLoadingSettings] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get('/api/settings');
            setAuthMode(res.data.authMode || 'local');
        } catch (err) {
            console.error('Failed to fetch settings:', err);
        } finally {
            setLoadingSettings(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('/api/login', { username, password });
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            onLogin(user);
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Show loading state while fetching settings
    if (loadingSettings) {
        return (
            <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
                <div className="text-gray-400">Loading...</div>
            </div>
        );
    }

    // External Auth Mode - Show Cloudflare message
    if (authMode === 'external') {
        return (
            <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-96 bg-blue-500/10 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-full h-96 bg-purple-500/10 blur-[120px] pointer-events-none" />

                <div className="relative z-10 w-full max-w-md">
                    <div className="bg-[#111827]/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl shadow-2xl p-8">
                        {/* Logo */}
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-tight mb-2">
                                NEXUS<span className="font-light text-gray-400">ADMIN</span>
                            </h1>
                            <p className="text-sm text-gray-500 font-medium tracking-wider uppercase">
                                Server Management System
                            </p>
                        </div>

                        {/* External Auth Message */}
                        <div className="space-y-6">
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 text-center">
                                <Shield size={48} className="text-blue-400 mx-auto mb-4" />
                                <h2 className="text-xl font-semibold text-white mb-2">
                                    Cloudflare Zero Trust Enabled
                                </h2>
                                <p className="text-gray-400 text-sm mb-4">
                                    This application is protected by Cloudflare Access.
                                </p>
                                <p className="text-gray-500 text-xs">
                                    You must access this application through your Cloudflare Access URL to authenticate.
                                </p>
                            </div>

                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                                <p className="text-yellow-400 text-xs text-center">
                                    <strong>Note:</strong> If you're seeing this locally, the backend is allowing access for testing.
                                    In production, ensure this app is only accessible through Cloudflare Access.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Local Auth Mode - Show login form
    return (
        <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-96 bg-blue-500/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-full h-96 bg-purple-500/10 blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-[#111827]/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl shadow-2xl p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-tight mb-2">
                            NEXUS<span className="font-light text-gray-400">ADMIN</span>
                        </h1>
                        <p className="text-sm text-gray-500 font-medium tracking-wider uppercase">
                            Server Management System
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
                                <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                                <span className="text-red-400 text-sm">{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-gray-400 text-sm font-medium mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-gray-950 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm font-medium mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-950 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    {/* Default Credentials Info */}
                    <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-yellow-400 text-xs text-center">
                            <strong>Default credentials:</strong> admin / admin
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
