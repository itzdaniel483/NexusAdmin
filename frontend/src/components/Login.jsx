import React, { useState } from 'react';
import axios from 'axios';
import { User, Lock, AlertCircle } from 'lucide-react';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:3000/api/login', {
                username,
                password
            });

            const { token, user } = res.data;

            // Store token and user info
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Set axios default header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Call parent callback
            onLogin(user);
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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
