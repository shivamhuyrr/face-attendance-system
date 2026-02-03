import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Trash2, UserPlus, Calendar, Users } from 'lucide-react';

interface User {
    id: number;
    name: string;
    department: string;
    profile_image_url: string | null;
    created_at: string;
}

interface Log {
    id: number;
    user_id: number;
    timestamp: string;
    screenshot_path: string | null;
    users?: User; // Joined Data
}

export function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');

    // Form State
    const [newName, setNewName] = useState('');
    const [newDept, setNewDept] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        fetchData();
        // Real-time subscription could go here
        const subscription = supabase
            .channel('public:attendance')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance' }, (payload) => {
                console.log('New Log!', payload);
                fetchData(); // Refresh on new attendance
            })
            .subscribe();

        return () => { supabase.removeChannel(subscription); };
    }, []);

    async function fetchData() {
        setLoading(true);
        // Fetch Users
        const { data: userData } = await supabase.from('users').select('*').order('id', { ascending: true });
        if (userData) setUsers(userData);

        // Fetch Logs
        const { data: logData } = await supabase
            .from('attendance')
            .select('*, users(name, department, profile_image_url)')
            .order('timestamp', { ascending: false })
            .limit(50);

        if (logData) setLogs(logData);
        setLoading(false);
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        if (!file || !newName) return alert("Name and Photo are required!");

        setRegistering(true);
        const formData = new FormData();
        formData.append('name', newName);
        formData.append('department', newDept);
        formData.append('file', file);

        try {
            // POST to FastAPI Backend (The Brain)
            const res = await fetch('http://127.0.0.1:8000/users/', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed');
            }

            alert("User Registered Successfully!");
            setNewName('');
            setNewDept('');
            setFile(null);
            fetchData(); // Refresh list
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setRegistering(false);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Are you sure? This deletes all their data.")) return;

        // Delete via API to ensure clean cascade
        await fetch(`http://127.0.0.1:8000/users/${id}`, { method: 'DELETE' });
        fetchData();
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    {activeTab === 'users' ? <Users /> : <Calendar />}
                    {activeTab === 'users' ? 'User Management' : 'Attendance Logs'}
                </h1>

                <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-md ${activeTab === 'users' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600'}`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`px-4 py-2 rounded-md ${activeTab === 'logs' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600'}`}
                    >
                        Logs
                    </button>
                </div>
            </header>

            {/* REGISTRATION FORM */}
            {activeTab === 'users' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-green-600" />
                        Register New Employee
                    </h2>
                    <form onSubmit={handleRegister} className="flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                className="px-3 py-2 border rounded-lg w-48 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <input
                                type="text"
                                value={newDept}
                                onChange={e => setNewDept(e.target.value)}
                                className="px-3 py-2 border rounded-lg w-48 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Engineering"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Face Photo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={e => setFile(e.target.files?.[0] || null)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={registering}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                        >
                            {registering ? 'Processing...' : 'Register User'}
                        </button>
                    </form>
                </div>
            )}

            {/* DATA TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                {activeTab === 'users' ? (
                                    <>
                                        <th className="px-6 py-3 font-medium text-gray-500">ID</th>
                                        <th className="px-6 py-3 font-medium text-gray-500">Profile</th>
                                        <th className="px-6 py-3 font-medium text-gray-500">Name</th>
                                        <th className="px-6 py-3 font-medium text-gray-500">Department</th>
                                        <th className="px-6 py-3 font-medium text-gray-500">Registered</th>
                                        <th className="px-6 py-3 font-medium text-gray-500">Action</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-3 font-medium text-gray-500">Time</th>
                                        <th className="px-6 py-3 font-medium text-gray-500">Name</th>
                                        <th className="px-6 py-3 font-medium text-gray-500">Evidence</th>
                                        <th className="px-6 py-3 font-medium text-gray-500">User ID</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading data...</td></tr>
                            ) : activeTab === 'users' ? (
                                users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-500">#{user.id}</td>
                                        <td className="px-6 py-4">
                                            {user.profile_image_url ? (
                                                <img src={user.profile_image_url} className="w-10 h-10 rounded-full object-cover border" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">?</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium">{user.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{user.department}</td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-700">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-blue-600">
                                            {log.users?.name || "Unknown"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.screenshot_path ? (
                                                <a href={log.screenshot_path} target="_blank" className="text-blue-500 hover:underline text-sm">View Photo</a>
                                            ) : <span className="text-gray-400">No Image</span>}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">#{log.user_id}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {!loading && users.length === 0 && activeTab === 'users' && (
                        <div className="p-8 text-center text-gray-500">No users found. Register one above!</div>
                    )}
                </div>
            </div>
        </div>
    );
}
