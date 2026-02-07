import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import {
    Users,
    TrendingUp,
    AlertTriangle,
    Search,
    MoreHorizontal,
    Calendar,
    ChevronDown,
    Clock
} from 'lucide-react';

interface Student {
    id: number;
    name: string;
    department: string;
    profile_image_url: string;
    role: string;
    email: string;
    // Computed fields
    attendance_count?: number;
    attendance_rate?: number;
    last_seen?: string;
}

interface AttendanceRecord {
    id: number;
    user_id: number;
    timestamp: string;
}

export function FacultyDashboard() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Stats
    const [stats, setStats] = useState({
        totalStudents: 0,
        avgAttendance: 0,
        atRisk: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const token = session.access_token;
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch Users & Attendance concurrently
            const [usersRes, attendanceRes] = await Promise.all([
                fetch('http://127.0.0.1:8000/users/', { headers }),
                supabase.from('attendance').select('*')
            ]);

            if (usersRes.ok) {
                const allUsers: Student[] = await usersRes.json();
                const allAttendance: AttendanceRecord[] = attendanceRes.data || [];

                // Filter Students
                const studentList = allUsers.filter(u => u.role === 'student');

                // Compute Stats per Student
                const detailedStudents = studentList.map(student => {
                    const studentLogs = allAttendance.filter(l => l.user_id === student.id);
                    const count = studentLogs.length;

                    // Mock Total Days (e.g., 30 days in a month/semester so far)
                    // In a real app, this would be dynamic based on the academic calendar
                    const totalDays = 30;
                    const rate = Math.min(100, Math.round((count / totalDays) * 100));

                    // Findings Last Seen
                    let lastSeen = 'Never';
                    if (studentLogs.length > 0) {
                        // Sort by timestamp desc
                        studentLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                        lastSeen = new Date(studentLogs[0].timestamp).toLocaleDateString();
                    }

                    return {
                        ...student,
                        attendance_count: count,
                        attendance_rate: rate,
                        last_seen: lastSeen
                    };
                });

                setStudents(detailedStudents);

                // Compute Aggregate Stats
                const total = detailedStudents.length;
                const totalRate = detailedStudents.reduce((sum, s) => sum + (s.attendance_rate || 0), 0);
                const avg = total > 0 ? Math.round(totalRate / total) : 0;
                const risk = detailedStudents.filter(s => (s.attendance_rate || 0) < 75).length;

                setStats({
                    totalStudents: total,
                    avgAttendance: avg,
                    atRisk: risk
                });
            }

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 relative overflow-hidden">
            {/* Background Gradients (Same as Student Dashboard for consistency) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-40 animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-40 animate-pulse delay-1000"></div>
            </div>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <span className="text-blue-600 font-bold tracking-wide uppercase text-xs mb-1 block">Academic Overview</span>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Faculty Dashboard</h1>
                        <p className="text-gray-500 mt-2">Monitor student attendance and performance metrics.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.location.href = '/faculty/profile'}
                            className="px-4 py-2 bg-white text-blue-600 text-sm font-semibold rounded-xl shadow-sm border border-blue-100 hover:bg-blue-50 transition flex items-center gap-2"
                        >
                            View My Profile
                        </button>
                        <span className="text-sm text-gray-500 font-medium">
                            <Calendar className="w-4 h-4 inline mr-2 text-gray-400" />
                            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/60 shadow-sm flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Students</p>
                            <h3 className="text-3xl font-black text-gray-900 mt-2">{stats.totalStudents}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/60 shadow-sm flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Avg. Attendance</p>
                            <div className="flex items-baseline gap-2 mt-2">
                                <h3 className="text-3xl font-black text-gray-900">{stats.avgAttendance}%</h3>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stats.avgAttendance >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {stats.avgAttendance >= 75 ? 'On Track' : 'Low'}
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/60 shadow-sm flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">At-Risk Students</p>
                            <h3 className="text-3xl font-black text-gray-900 mt-2">{stats.atRisk}</h3>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Timetable Teaser */}
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Upcoming Class: Database Systems</h3>
                            <p className="text-sm text-gray-500">Starts in 45 mins • Room LH-102</p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.location.href = '/faculty/profile'}
                        className="px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-200"
                    >
                        View Full Schedule
                    </button>
                </div>

                {/* Filters & Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 p-2 rounded-2xl border border-white/60">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search students by name or department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-200 transition-all shadow-sm placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-gray-600 text-sm font-semibold rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition flex items-center gap-2 justify-center">
                            Filter <ChevronDown className="w-3 h-3" />
                        </button>
                        <button className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-md hover:bg-blue-700 transition">
                            Download Report
                        </button>
                    </div>
                </div>

                {/* Student Table */}
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100/50 bg-gray-50/50">
                                    <th className="px-6 py-4 font-semibold text-gray-400 text-xs uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-4 font-semibold text-gray-400 text-xs uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-4 font-semibold text-gray-400 text-xs uppercase tracking-wider">Attendance Rate</th>
                                    <th className="px-6 py-4 font-semibold text-gray-400 text-xs uppercase tracking-wider">Last Seen</th>
                                    <th className="px-6 py-4 font-semibold text-gray-400 text-xs uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan={5} className="text-center py-20 text-gray-400 animate-pulse">Loading student data...</td></tr>
                                ) : filteredStudents.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-20 text-gray-400">No students found matching your search.</td></tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-white/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm shadow-sm">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{student.name}</p>
                                                        <p className="text-xs text-gray-400">{student.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold border border-gray-200">
                                                    {student.department}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 w-64">
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-sm font-bold ${(student.attendance_rate || 0) >= 75 ? 'text-green-600' : 'text-amber-600'}`}>
                                                        {student.attendance_rate}%
                                                    </span>
                                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${(student.attendance_rate || 0) >= 75 ? 'bg-green-500' : 'bg-amber-400'}`}
                                                            style={{ width: `${student.attendance_rate}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                                {student.last_seen}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition">
                                                    <MoreHorizontal className="w-5 h-5" />
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
        </div>
    );
}
