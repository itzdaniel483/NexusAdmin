import React, { useState, useEffect } from 'react';
import ServerList from './components/ServerList';
import ServerControl from './components/ServerControl';
import Installer from './components/Installer';
import Settings from './components/Settings';
import Login from './components/Login';
import { Server, LayoutDashboard, Download, Settings as SettingsIcon, LogOut, Menu, X } from 'lucide-react';
import axios from 'axios';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('servers');
  const [selectedServer, setSelectedServer] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const checkAuth = async () => {
    // Check if external auth is enabled FIRST
    try {
      const res = await axios.get('/api/settings');
      if (res.data.authMode === 'external') {
        // External auth mode - clear any local tokens
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];

        // Try to verify with backend (which will check for Cloudflare JWT)
        try {
          await axios.get('/api/servers');
          // If successful, we're authenticated via Cloudflare
          setUser({ username: 'Cloudflare User', role: 'admin' });
        } catch {
          // Not authenticated - will show login screen with Cloudflare message
          console.log('Not authenticated via Cloudflare');
        }
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('Failed to check auth settings:', err);
    }

    // Local auth mode - check for token
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const handleSelectServer = (server) => {
    setSelectedServer(server);
    setActiveTab('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="flex h-screen bg-[#0b0f19] text-white font-sans overflow-hidden selection:bg-blue-500/30">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-[#111827]/80 backdrop-blur-xl border-r border-gray-800/50 flex flex-col shadow-2xl relative z-20 transition-all duration-300`}>
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-8 w-6 h-6 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg transition-colors z-30"
        >
          {sidebarCollapsed ? <Menu size={14} /> : <X size={14} />}
        </button>

        <div className="p-6 mb-2">
          {!sidebarCollapsed ? (
            <>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-tight">
                SERVER<span className="font-light text-gray-400">FORGE</span>
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-medium tracking-wider uppercase">Server Management System</p>
            </>
          ) : (
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 text-center">
              S
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-3">
          <NavButton
            active={activeTab === 'servers'}
            onClick={() => setActiveTab('servers')}
            icon={<Server size={24} />}
            label="Servers"
            collapsed={sidebarCollapsed}
          />
          <NavButton
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
            icon={<LayoutDashboard size={24} />}
            label="Console"
            collapsed={sidebarCollapsed}
          />
          <NavButton
            active={activeTab === 'installer'}
            onClick={() => setActiveTab('installer')}
            icon={<Download size={24} />}
            label="Installer"
            collapsed={sidebarCollapsed}
          />
          <NavButton
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
            icon={<SettingsIcon size={24} />}
            label="Settings"
            collapsed={sidebarCollapsed}
          />
        </nav>

        <div className="p-6 mt-auto border-t border-gray-800/50 space-y-3">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center space-x-3 bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold uppercase">
                  {user.username.substring(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-200">{user.username}</div>
                  <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors border border-red-600/50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold uppercase">
                  {user.username.substring(0, 2)}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white p-3 rounded-lg transition-colors border border-red-600/50"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-96 bg-blue-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-full h-96 bg-purple-500/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10 p-10 max-w-7xl mx-auto">
          <header className="mb-10 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {activeTab === 'dashboard' && selectedServer ? selectedServer.name : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
              <p className="text-gray-400">
                {activeTab === 'servers' && 'Manage your game servers'}
                {activeTab === 'dashboard' && 'Server console and controls'}
                {activeTab === 'installer' && 'Install new game servers'}
                {activeTab === 'settings' && 'Configure your panel'}
              </p>
            </div>
          </header>

          <main>
            {activeTab === 'servers' && <ServerList onSelectServer={handleSelectServer} />}
            {activeTab === 'dashboard' && selectedServer && <ServerControl server={selectedServer} />}
            {activeTab === 'dashboard' && !selectedServer && (
              <div className="text-center text-gray-500 py-20">
                <Server size={64} className="mx-auto mb-4 opacity-20" />
                <p>Select a server from the Servers tab to view its console</p>
              </div>
            )}
            {activeTab === 'installer' && <Installer />}
            {activeTab === 'settings' && <Settings />}
          </main>
        </div>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, collapsed }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center ${collapsed ? 'justify-center' : 'space-x-4'} px-5 py-4 rounded-xl font-semibold text-base transition-all ${active
        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
        : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
        }`}
      title={collapsed ? label : ''}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </button>
  );
}

export default App;
