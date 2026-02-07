import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { Trash2, AlertTriangle, ShieldAlert, Database, Activity, Filter, RefreshCw, Eye } from 'lucide-react';

interface Log {
    id: number;
    user_id: number;
    timestamp: string;
    screenshot_path: string | null;
    user?: { // Joined user data
        name: string;
        role: string;
    }
}

export function SupportDashboard() {
    const navigate = useNavigate();
    const [logs, setLogs] = useState<Log[]>([]);
    const [roleFilter, setRoleFilter] = useState('All');
    const [stats, setStats] = useState({ users: 0, logs: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/login');
            return;
        }
        fetchData();
    }

    async function fetchData() {
        setLoading(true);
        // Fetch Stats
        const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: logCount } = await supabase.from('attendance').select('*', { count: 'exact', head: true });

        setStats({ users: userCount || 0, logs: logCount || 0 });

        // Fetch Recent Logs with User Data
        const { data, error } = await supabase
            .from('attendance')
            .select(`
                *,
                user:users (
                    name,
                    role
                )
            `)
            .order('timestamp', { ascending: false })
            .limit(50);

        if (data) {
            // Flatten the structure for easier usage if needed, or just use nested
            setLogs(data as any);
        }
        if (error) console.error(error);
        setLoading(false);
    }

    async function handleSystemReset() {
        const confirm1 = prompt("TYPE 'RESET' TO CONFIRM SYSTEM WIPE. THIS CANNOT BE UNDONE.");
        if (confirm1 !== 'RESET') return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            await fetch('http://127.0.0.1:8000/reset/', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            });
            alert("System Reset Complete.");
            fetchData();
        } catch (e) {
            alert("Reset Failed: " + e);
        }
    }

    // Filter Logic
    const filteredLogs = roleFilter === 'All'
        ? logs
        : logs.filter(log => log.user?.role === roleFilter.toLowerCase());

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="bg-red-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-800 rounded-full blur-3xl opacity-50 -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="relative z-10 flex items-center gap-6">
                        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                            <ShieldAlert className="w-10 h-10 text-red-200" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Technical Support</h1>
                            <p className="text-red-200 font-medium">System Infrastructure & Maintenance</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                            <Activity className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-gray-500 font-bold uppercase text-xs tracking-wider">Total Users</p>
                            <h3 className="text-3xl font-black text-gray-900">{stats.users}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="p-4 bg-green-50 text-green-600 rounded-xl">
                            <Database className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-gray-500 font-bold uppercase text-xs tracking-wider">Total Logs</p>
                            <h3 className="text-3xl font-black text-gray-900">{stats.logs}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 hover:border-red-300 transition-colors cursor-pointer group" onClick={handleSystemReset}>
                        <div className="flex flex-col items-center justify-center text-center h-full">
                            <div className="flex items-center gap-2 text-red-600 font-bold mb-1 group-hover:scale-110 transition-transform">
                                <Trash2 className="w-5 h-5" /> EMERGENCY RESET
                            </div>
                            <p className="text-xs text-red-400">Irreversible Action</p>
                        </div>
                    </div>
                </div>

                {/* Logs Section with Enhanced Filters */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            System Logs
                        </h3>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-bold text-gray-500 uppercase">Role:</span>
                                <select
                                    className="bg-transparent border-none text-sm font-bold text-gray-900 focus:ring-0 cursor-pointer"
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="All">All Roles</option>
                                    <option value="Student">Student</option>
                                    <option value="Faculty">Faculty</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <button
                                onClick={fetchData}
                                className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition"
                                title="Refresh Logs"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-gray-400 font-bold uppercase text-xs tracking-wider">Timestamp</th>
                                    <th className="px-6 py-4 text-gray-400 font-bold uppercase text-xs tracking-wider">User</th>
                                    <th className="px-6 py-4 text-gray-400 font-bold uppercase text-xs tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-gray-400 font-bold uppercase text-xs tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-gray-400 font-bold uppercase text-xs tracking-wider text-right">Evidence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-gray-400">No logs found for this filter.</td>
                                    </tr>
                                ) : (
                                    filteredLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-blue-50/50 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-gray-500">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{log.user?.name || `UID: ${log.user_id}`}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${log.user?.role === 'student' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                        log.user?.role === 'faculty' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                            'bg-gray-100 text-gray-600 border-gray-200'
                                                    }`}>
                                                    {(log.user?.role || 'Unknown').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="flex items-center gap-1.5 text-green-600 font-bold text-xs">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                    Present
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {log.screenshot_path ? (
                                                    <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-bold hover:underline">
                                                        <Eye className="w-3 h-3" /> View Source
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-300 text-xs">No Data</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
