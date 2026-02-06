import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { Trash2, AlertTriangle, ShieldAlert, Database, Activity } from 'lucide-react';

interface Log {
    id: number;
    user_id: number;
    timestamp: string;
    screenshot_path: string | null;
}

export function SupportDashboard() {
    const navigate = useNavigate();
    const [logs, setLogs] = useState<Log[]>([]);
    const [stats, setStats] = useState({ users: 0, logs: 0 });

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/login'); // Fixed redirect
            return;
        }
        // TODO: Strict Role Check for 'support' would go here
        fetchData();
    }

    async function fetchData() {
        // Fetch Stats
        const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: logCount } = await supabase.from('attendance').select('*', { count: 'exact', head: true });

        setStats({ users: userCount || 0, logs: logCount || 0 });

        // Fetch Recent Logs
        const { data } = await supabase
            .from('attendance')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(20);

        if (data) setLogs(data);
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

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="bg-red-900 text-white rounded-2xl p-8 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-800 rounded-full blur-3xl opacity-50 -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                            <ShieldAlert className="w-12 h-12 text-red-300" />
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight">Technical Support</h1>
                                <p className="text-red-200 text-lg">System Infrastructure & Maintenance</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                            <Activity className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium uppercase text-xs tracking-wider">Total Users</p>
                            <h3 className="text-3xl font-bold text-gray-900">{stats.users}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-4 bg-green-50 text-green-600 rounded-xl">
                            <Database className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium uppercase text-xs tracking-wider">Total Logs</p>
                            <h3 className="text-3xl font-bold text-gray-900">{stats.logs}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-50 flex items-center gap-4">
                        <button
                            onClick={handleSystemReset}
                            className="w-full h-full flex items-center justify-center gap-3 text-red-600 hover:bg-red-50 rounded-xl transition font-bold border-2 border-red-100 border-dashed py-2"
                        >
                            <Trash2 className="w-6 h-6" />
                            EMERGENCY RESET
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/30">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            Raw System Logs (Recent)
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm font-mono">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-gray-500 font-semibold uppercase text-xs">ID</th>
                                    <th className="px-6 py-3 text-gray-500 font-semibold uppercase text-xs">Timestamp</th>
                                    <th className="px-6 py-3 text-gray-500 font-semibold uppercase text-xs">User Ref</th>
                                    <th className="px-6 py-3 text-gray-500 font-semibold uppercase text-xs">Evidence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {logs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4 text-gray-600">#{log.id}</td>
                                        <td className="px-6 py-4 text-gray-900">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-blue-600">UID:{log.user_id}</td>
                                        <td className="px-6 py-4 truncate max-w-xs text-gray-500 italic">{log.screenshot_path || "NULL"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
