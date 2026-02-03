import { useState } from 'react';
import { supabase } from '../supabase';
import { Search, Clock } from 'lucide-react';

interface Log {
    id: number;
    timestamp: string;
    screenshot_path: string | null;
}

export function UserDashboard() {
    const [searchId, setSearchId] = useState('');
    const [logs, setLogs] = useState<Log[]>([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!searchId) return;

        setLoading(true);
        setSearched(true);

        const { data } = await supabase
            .from('attendance')
            .select('*')
            .eq('user_id', searchId)
            .order('timestamp', { ascending: false });

        if (data) setLogs(data);
        setLoading(false);
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">My Attendance Logs</h1>
                <p className="text-gray-500">Enter your Employee ID to view your history</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="number"
                        value={searchId}
                        onChange={e => setSearchId(e.target.value)}
                        placeholder="Enter ID (e.g., 5)"
                        className="flex-1 px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Search className="w-5 h-5" />
                        Check
                    </button>
                </form>
            </div>

            {searched && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-500" />
                        Attendance History ({logs.length})
                    </h2>

                    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading...</div>
                        ) : logs.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No records found for ID {searchId}</div>
                        ) : (
                            <div className="divide-y">
                                {logs.map(log => (
                                    <div key={log.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {new Date(log.timestamp).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        {log.screenshot_path && (
                                            <a href={log.screenshot_path} target="_blank" className="text-sm text-blue-600 hover:underline">
                                                View Evidence
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
