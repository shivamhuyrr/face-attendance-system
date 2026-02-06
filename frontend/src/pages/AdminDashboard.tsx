
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { Trash2, UserPlus, Users, CheckCircle, ShieldAlert, Calendar } from 'lucide-react';

interface User {
    id: number;
    name: string;
    department: string;
    email: string | null; // New field
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
    const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
    const navigate = useNavigate();

    // Form State
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newDept, setNewDept] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        checkAuth();

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

    async function checkAuth() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/login');
            return;
        }
        fetchData();
    }

    async function fetchData() {

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

    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        if (!file || !newName) return alert("Name and Photo are required!");

        setRegistering(true);
        const formData = new FormData();
        formData.append('name', newName);
        if (newEmail) formData.append('email', newEmail);
        formData.append('department', newDept);
        formData.append('file', file);

        try {
            // POST to FastAPI Backend (The Brain)
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const res = await fetch('http://127.0.0.1:8000/users/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token} `
                },
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed');
            }

            alert("User Registered Successfully!");
            setNewName('');
            setNewEmail('');
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
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        await fetch(`http://127.0.0.1:8000/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        fetchData();
    }

    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Employees</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{users.length}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-green-600">
                        <span className="font-bold">+2.5%</span>
                        <span className="text-gray-400 ml-1">from last month</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Present Today</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{logs.length}</h3>
                        </div>
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Absent</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">
                                {Math.max(0, users.length - logs.length)}
                            </h3>
                        </div>
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                    <p className="text-blue-100 text-sm font-medium">System Status</p>
                    <p className="font-bold mt-1 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span> Online
                    </p>
                    <p className="text-xs text-blue-200">Database Connected</p>
                </div>
            </div>

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Registration Card */}
                {activeTab === 'users' && (
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-800">Register Employee</h2>
                            </div>

                            <form onSubmit={handleRegister} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. Sarah Smith"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={e => setNewEmail(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="sarah@company.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <input
                                        type="text"
                                        value={newDept}
                                        onChange={e => setNewDept(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. Marketing"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setFile(e.target.files?.[0] || null)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="space-y-2">
                                            <div className="mx-auto w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {file ? file.name : "Click to upload photo"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={registering}
                                    className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50"
                                >
                                    {registering ? 'Processing...' : 'Register Employee'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Main Content Area (Table) */}
                <div className={activeTab === 'users' ? "lg:col-span-2" : "col-span-3"}>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white border-b border-gray-100">
                                    <tr>
                                        {activeTab === 'users' ? (
                                            <>
                                                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Profile</th>
                                                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Department</th>
                                                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Action</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Time</th>
                                                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Employee</th>
                                                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Evidence</th>
                                                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">ID Ref</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {activeTab === 'users' ? (
                                        users.map(user => (
                                            <tr key={user.id} className="hover:bg-blue-50/50 transition duration-150">
                                                <td className="px-6 py-4">
                                                    {user.profile_image_url ? (
                                                        <img src={user.profile_image_url} alt={user.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                                            {user.name[0]}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{user.name}</p>
                                                        <p className="text-xs text-gray-500">{user.email || 'No email'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                        {user.department || 'General'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                        Active
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="text-gray-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        logs.map(log => (
                                            <tr key={log.id} className="hover:bg-blue-50/50 transition">
                                                <td className="px-6 py-4 text-gray-600 text-sm font-mono">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {log.users?.name || "Unknown"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {log.screenshot_path ? (
                                                        <a href={log.screenshot_path} target="_blank" className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1">
                                                            View Photo
                                                        </a>
                                                    ) : <span className="text-gray-400 text-sm">No Image</span>}
                                                </td>
                                                <td className="px-6 py-4 text-gray-400 text-xs">#{log.user_id}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            {activeTab === 'users' && users.length === 0 && (
                                <div className="p-12 text-center text-gray-500">
                                    <p>No employees registered yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
