import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Clock, Calendar, CheckCircle, User, Bell, ChevronRight, AlertCircle } from 'lucide-react';

interface Log {
    id: number;
    timestamp: string;
    screenshot_path: string | null;
}

interface Announcement {
    id: number;
    title: string;
    content: string;
    created_at: string;
}

export function StudentDashboard() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [userDept, setUserDept] = useState('');

    useEffect(() => {
        loadDashboardData();
    }, []);

    async function loadDashboardData() {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user?.email) {
            setLoading(false);
            return;
        }

        try {
            const token = session.access_token;
            const headers = {
                'Authorization': `Bearer ${token}`
            };

            // 1. Get My User ID
            const resUser = await fetch(`http://127.0.0.1:8000/users/by_email/?email=${session.user.email}`);
            if (!resUser.ok) throw new Error("User not linked");
            const user = await resUser.json();

            setUserName(user.name);
            setUserDept(user.department || 'General');

            // 2. Parallel Fetch: Logs, Announcements
            const [logsRes, annRes] = await Promise.all([
                supabase.from('attendance').select('*').eq('user_id', user.id).order('timestamp', { ascending: false }),
                fetch('http://127.0.0.1:8000/announcements/', { headers })
            ]);

            if (logsRes.data) setLogs(logsRes.data);
            if (annRes.ok) setAnnouncements(await annRes.json());

        } catch (e) {
            console.error("Dashboard Load Error:", e);
        } finally {
            setLoading(false);
        }
    }

    // Stats Logic
    const totalAttendance = logs.length;
    const thisMonth = logs.filter(l => new Date(l.timestamp).getMonth() === new Date().getMonth()).length;
    const lastClockIn = logs.length > 0 ? new Date(logs[0].timestamp).toLocaleString() : 'N/A';

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-40 animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-[120px] opacity-40 animate-pulse delay-1000"></div>
            </div>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section with Glassmorphism */}
                <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 shadow-xl border border-white/50 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-blue-100/50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-200/50 backdrop-blur-sm">
                                    Student Portal
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                                Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{userName || 'Student'}</span>
                            </h1>
                            <p className="text-gray-500 mt-3 text-lg font-medium">Ready to achieve your academic goals properly?</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="px-5 py-3 bg-white/80 backdrop-blur-md text-gray-700 rounded-2xl font-semibold text-sm border border-white/60 shadow-sm flex items-center gap-3 hover:scale-105 transition-transform duration-200 cursor-default">
                                <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                                    <User className="w-4 h-4" />
                                </div>
                                {userDept || 'General Department'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Stats & Logs (8 cols) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Interactive Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { title: 'Total Check-ins', value: totalAttendance, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                                { title: 'This Month', value: thisMonth, icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
                                { title: 'Last Active', value: lastClockIn === 'N/A' ? 'Never' : lastClockIn.split(',')[0], icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' }
                            ].map((stat, idx) => (
                                <div key={idx} className="bg-white/60 backdrop-blur-lg p-6 rounded-2xl shadow-sm border border-white/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.title}</p>
                                            <h3 className="text-3xl font-black text-gray-900 mt-2 group-hover:scale-110 origin-left transition-transform duration-300">{stat.value}</h3>
                                        </div>
                                        <div className={`p-3 ${stat.bg} ${stat.color} rounded-xl ${stat.border} border shadow-inner group-hover:rotate-12 transition-transform duration-300`}>
                                            <stat.icon className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity Section */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                            <div className="p-6 md:p-8 border-b border-gray-100/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-gray-400" />
                                        Recent Activity
                                    </h2>
                                    <p className="text-gray-400 text-sm mt-1">Your latest attendance records</p>
                                </div>
                                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                                    View Full History
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100/50">
                                            <th className="px-8 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Date & Time</th>
                                            <th className="px-8 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Status</th>
                                            <th className="px-8 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider text-right">Confirmation</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50/50">
                                        {loading ? (
                                            <tr><td colSpan={3} className="text-center py-16 text-gray-400 animate-pulse">Loading records...</td></tr>
                                        ) : logs.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="text-center py-16">
                                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                                        <Clock className="w-12 h-12 mb-4 opacity-20" />
                                                        <p className="text-lg font-medium">No records found</p>
                                                        <p className="text-sm">Your attendance history will appear here.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            logs.slice(0, 5).map((log) => (
                                                <tr key={log.id} className="hover:bg-white/50 transition-colors duration-150 group">
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-800 text-base">
                                                                {new Date(log.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                            </span>
                                                            <span className="text-gray-400 text-sm font-medium font-mono">
                                                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-green-50 text-green-700 border border-green-100/50 shadow-sm">
                                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                                            Verified Present
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <button className="text-xs font-semibold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-wider">
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Announcements & Extras (4 cols) */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Announcements Card */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/50 p-6 md:p-8 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 rounded-xl shadow-inner">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg">Announcements</h3>
                            </div>

                            {announcements.length > 0 ? (
                                <div className="space-y-4">
                                    {announcements.slice(0, 2).map(ann => (
                                        <div key={ann.id} className="p-4 bg-white/60 rounded-2xl border border-white/60 shadow-sm hover:scale-[1.02] transition-transform duration-200">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                    {new Date(ann.created_at).toLocaleDateString()}
                                                </span>
                                                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                                            </div>
                                            <h4 className="font-bold text-gray-800 mb-1 leading-snug">{ann.title}</h4>
                                            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{ann.content}</p>
                                        </div>
                                    ))}
                                    <button className="w-full mt-2 py-3 text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-white/50 rounded-xl transition-all flex items-center justify-center gap-2 group">
                                        View All Announcements
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Bell className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <p className="text-gray-400 font-medium">All caught up!</p>
                                    <p className="text-xs text-gray-400 mt-1">No new announcements today</p>
                                </div>
                            )}
                        </div>

                        {/* Profile/Status Card */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden group">
                            {/* Decorative Rings */}
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-1">Academic Status</h3>
                                <p className="text-blue-100 text-sm mb-6 opacity-90">Current Semester Overview</p>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                                        <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-300">
                                            <CheckCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-100 font-medium uppercase tracking-wide">Standing</p>
                                            <p className="font-bold text-lg leading-none mt-1">Good</p>
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full mt-6 py-3 bg-white text-blue-600 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                                    View Full Profile
                                </button>
                            </div>
                        </div>

                        {/* Help / Alert Box */}
                        <div className="bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-2xl p-4 flex gap-3 items-start">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="text-sm font-bold text-red-800">Need Help?</h4>
                                <p className="text-xs text-red-600 mt-1 leading-relaxed">
                                    If you notice an error in your attendance, please contact your faculty advisor immediately.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
