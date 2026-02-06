import { useState, useEffect } from 'react';
import { supabase } from '../supabase';


interface Student {
    id: number;
    name: string;
    department: string;
    profile_image_url: string;
    role: string;
}

export function FacultyDashboard() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);


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

            const [usersRes] = await Promise.all([
                fetch('http://127.0.0.1:8000/users/', { headers }),
            ]);

            if (usersRes.ok) {
                const allUsers: Student[] = await usersRes.json();
                // Filter for just students
                setStudents(allUsers.filter(u => u.role === 'student'));
            }


        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-gray-500">Loading Faculty Portal...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
                    <p className="text-gray-500 mt-2">Manage academic curriculum and resources here.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Placeholder for student list or other content */}
                    {students.length > 0 ? (
                        students.map(student => (
                            <div key={student.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                                    {student.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{student.name}</h3>
                                    <p className="text-sm text-gray-500">{student.department}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100 border-dashed">
                            No students found via API yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
