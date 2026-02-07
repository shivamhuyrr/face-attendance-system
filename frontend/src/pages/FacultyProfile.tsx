import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { BookOpen, Calendar, MapPin, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function FacultyProfile() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
            // Fetch user details
            const res = await fetch(`http://127.0.0.1:8000/users/by_email/?email=${session.user.email}`);
            if (res.ok) setUser(await res.json());
        }
        setLoading(false);
    }

    // Mock Syllabus Data
    const syllabus = [
        { subject: 'Advanced Algorithms', covered: 45, total: 60, unit: 'Unit 3: Dynamic Programming' },
        { subject: 'Database Systems', covered: 28, total: 40, unit: 'Unit 2: Normalization' },
        { subject: 'Web Architecture', covered: 12, total: 35, unit: 'Unit 1: REST APIs' },
    ];

    // Mock Time Table
    const todaySchedule = [
        { time: '09:00 AM', subject: 'Advanced Algorithms', room: 'LH-101', type: 'Lecture' },
        { time: '11:00 AM', subject: 'Database Systems', room: 'Lab-2', type: 'Lab' },
        { time: '02:00 PM', subject: 'Web Architecture', room: 'LH-104', type: 'Lecture' },
    ];

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Profile...</div>;

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 relative">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Back Button */}
                <button
                    onClick={() => navigate('/faculty')}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4 font-medium"
                >
                    <ChevronLeft className="w-5 h-5" /> Back to Dashboard
                </button>

                {/* Profile Header */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-600 shadow-inner flex-shrink-0">
                        {(user?.name || 'F').charAt(0)}
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-black text-gray-900">{user?.name || 'Faculty Member'}</h1>
                        <p className="text-lg text-gray-500 font-medium">{user?.department || 'Computer Science Department'}</p>
                        <div className="flex items-center gap-4 justify-center md:justify-start mt-4">
                            <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-bold">Active Status</span>
                            <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">Full Time</span>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 min-w-[200px]">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">My Attendance</p>
                        <div className="text-3xl font-black text-gray-900">92%</div>
                        <p className="text-xs text-gray-400 mt-1">Present 22/24 Days</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Syllabus Tracker */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-500" /> Syllabus Coverage
                        </h2>
                        <div className="space-y-6">
                            {syllabus.map((item, idx) => {
                                const percentage = Math.round((item.covered / item.total) * 100);
                                return (
                                    <div key={idx}>
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <h3 className="font-bold text-gray-800">{item.subject}</h3>
                                                <p className="text-xs text-gray-500">{item.unit}</p>
                                            </div>
                                            <span className="text-sm font-bold text-blue-600">{percentage}%</span>
                                        </div>
                                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-600 rounded-full"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Today's Schedule */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-500" /> Today's Timetable
                        </h2>
                        <div className="space-y-4">
                            {todaySchedule.map((slot, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                    <div className="w-16 text-center">
                                        <p className="font-bold text-gray-900">{slot.time.split(' ')[0]}</p>
                                        <p className="text-xs text-gray-500">{slot.time.split(' ')[1]}</p>
                                    </div>
                                    <div className="flex-1 border-l-2 border-gray-100 pl-4">
                                        <h3 className="font-bold text-gray-800">{slot.subject}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {slot.room}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-md ${slot.type === 'Lecture' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                {slot.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition">
                            View Full Weekly Schedule
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
