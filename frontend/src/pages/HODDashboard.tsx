import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Briefcase, Filter, Calendar, Bell, Plus, CheckCircle, XCircle, TrendingUp, Users } from 'lucide-react';

interface Faculty {
    id: number;
    name: string;
    department: string;
    email: string;
    role: string;
    // Mocked Stats
    attendance_rate?: number;
    classes_taken?: number;
}

export function HODDashboard() {
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [deptFilter, setDeptFilter] = useState('All');

    // Mock Data for "More Things"
    const leaveRequests = [
        { id: 1, name: 'Dr. Sarah Wilson', type: 'Sick Leave', dates: 'Feb 10 - Feb 12', status: 'Pending' },
        { id: 2, name: 'Prof. James Chen', type: 'Conference', dates: 'Feb 15', status: 'Pending' },
    ];

    const deptPerformance = [
        { name: 'CS', value: 94, color: 'bg-blue-500' },
        { name: 'IT', value: 88, color: 'bg-purple-500' },
        { name: 'ECE', value: 91, color: 'bg-green-500' },
        { name: 'Mech', value: 85, color: 'bg-orange-500' },
    ];

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const headers = { 'Authorization': `Bearer ${token}` };

            const res = await fetch('http://127.0.0.1:8000/users/', { headers });
            if (res.ok) {
                const allUsers: Faculty[] = await res.json();
                // Filter for faculty
                const facultyList = allUsers.filter(u => u.role === 'faculty' || true); // Allow all for demo

                // Add Mock Stats
                const enriched = facultyList.map(f => ({
                    ...f,
                    attendance_rate: Math.floor(Math.random() * (100 - 85 + 1) + 85),
                    classes_taken: Math.floor(Math.random() * 40) + 10
                }));
                setFaculties(enriched);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const filteredFaculties = deptFilter === 'All'
        ? faculties
        : faculties.filter(f => f.department === deptFilter);

    const uniqueDepts = Array.from(new Set(faculties.map(f => f.department).filter(Boolean)));

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header with Quick Actions */}
                <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px] opacity-20 -mr-32 -mt-32 pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                        <div>
                            <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">
                                <Briefcase className="w-4 h-4" /> Administration Portal
                            </div>
                            <h1 className="text-4xl font-black tracking-tight">Department Overview</h1>
                            <p className="text-slate-400 mt-2 max-w-xl">Manage faculty performance, approve leaves, and monitor departmental health metrics.</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/50">
                                <Plus className="w-5 h-5" /> Add Faculty
                            </button>
                            <button className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all backdrop-blur-md">
                                <Bell className="w-5 h-5" /> Broadcast Notice
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase">Total Faculty</p>
                            <p className="text-2xl font-black text-white">{faculties.length}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase">Avg Attendance</p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-black text-green-400">94%</p>
                                <TrendingUp className="w-4 h-4 text-green-400" />
                            </div>
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase">Pending Leaves</p>
                            <p className="text-2xl font-black text-amber-400">{leaveRequests.length}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase">Performance</p>
                            <p className="text-2xl font-black text-white">Excellent</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Column: Faculty List & Filters */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Filters */}
                        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                                <Filter className="w-4 h-4" /> Filter Department:
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                                <button
                                    onClick={() => setDeptFilter('All')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${deptFilter === 'All' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    All
                                </button>
                                {uniqueDepts.map(dept => (
                                    <button
                                        key={dept}
                                        onClick={() => setDeptFilter(dept)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${deptFilter === dept ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        {dept}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Faculty Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {loading ? (
                                <p className="text-gray-400 col-span-2 text-center py-10">Loading faculty data...</p>
                            ) : filteredFaculties.map((faculty) => (
                                <div key={faculty.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-100 transition-colors group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                {faculty.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{faculty.name}</h3>
                                                <p className="text-xs text-gray-500">{faculty.department || 'General'}</p>
                                            </div>
                                        </div>
                                        <div className={`text-xs font-bold px-2 py-1 rounded-md ${(faculty.attendance_rate || 0) >= 90 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {faculty.attendance_rate}% Att.
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50 rounded-lg p-2 text-xs">
                                        <span className="text-gray-500">Classes Taken</span>
                                        <span className="font-bold text-gray-900">{faculty.classes_taken} / 60</span>
                                    </div>
                                    <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(faculty.classes_taken || 0) / 60 * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Sidebar: Actions & Insights */}
                    <div className="space-y-6">

                        {/* Leave Requests */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-amber-500" /> Pending Leaves
                                </h2>
                                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">{leaveRequests.length} New</span>
                            </div>
                            <div className="space-y-4">
                                {leaveRequests.map(req => (
                                    <div key={req.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{req.name}</p>
                                                <p className="text-xs text-gray-500">{req.type} • {req.dates}</p>
                                            </div>
                                            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <button className="flex-1 py-1.5 bg-white border border-gray-200 text-green-600 text-xs font-bold rounded-lg hover:bg-green-50 hover:border-green-200 transition flex items-center justify-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Approve
                                            </button>
                                            <button className="flex-1 py-1.5 bg-white border border-gray-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 hover:border-red-200 transition flex items-center justify-center gap-1">
                                                <XCircle className="w-3 h-3" /> Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 text-xs text-gray-400 font-semibold hover:text-gray-600">View All Requests</button>
                        </div>

                        {/* Dept Performance Chart (Mock) */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
                                <TrendingUp className="w-5 h-5 text-blue-500" /> Dept Performance
                            </h2>
                            <div className="space-y-4">
                                {deptPerformance.map(d => (
                                    <div key={d.name}>
                                        <div className="flex justify-between text-xs font-bold mb-1">
                                            <span className="text-gray-500">{d.name} Department</span>
                                            <span className="text-gray-900">{d.value}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${d.color}`} style={{ width: `${d.value}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
