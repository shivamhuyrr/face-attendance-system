import { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginProps {
    role?: 'user' | 'admin' | 'support' | 'student' | 'faculty';
}


export function Login({ role = 'user' }: LoginProps) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Success!
            if (role === 'admin') navigate('/admin');
            else if (role === 'support') navigate('/support');
            else navigate('/user');
        }
    }



    return (

        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            {/* Container */}
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2 overflow-hidden min-h-[600px]">

                {/* Left: Visual / Branding */}
                <div className="hidden md:flex flex-col justify-center px-12 bg-gradient-to-br from-blue-800 to-blue-700 text-white relative">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <ShieldCheck className="w-10 h-10 text-blue-200" />
                            <span className="text-xl font-bold tracking-wide uppercase">SecureAttend</span>
                        </div>
                        <h1 className="text-4xl font-bold leading-tight mb-4">
                            University Access Portal
                        </h1>
                        <p className="text-blue-100 text-lg max-w-sm leading-relaxed">
                            Secure platform for biometric attendance, academic development,
                            and institutional workflows.
                        </p>

                        <div className="mt-12 space-y-4 text-sm font-medium text-blue-50">
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-blue-600/50 flex items-center justify-center text-xs">✓</span>
                                Face Recognition Attendance
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-blue-600/50 flex items-center justify-center text-xs">✓</span>
                                Individual Development Plans
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-blue-600/50 flex items-center justify-center text-xs">✓</span>
                                Faculty & Admin Controls
                            </div>
                        </div>
                    </div>
                    {/* Decorational Circle */}
                    <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
                </div>

                {/* Right: Login */}
                <div className="flex flex-col justify-center px-8 sm:px-16 py-12">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">
                            Sign in
                        </h2>
                        <p className="text-slate-500">
                            {role === 'admin' ? 'Administrative Access Portal' :
                                role === 'support' ? 'Support & Diagnostics Console' :
                                    'Use credentials provided by your institution'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center gap-3 text-sm animate-fade-in-down">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignIn} className="space-y-6">
                        {/* Email / ID */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                University Email ID
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@university.edu"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition text-slate-900 placeholder:text-slate-400"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-sm font-medium text-slate-700">
                                    Password
                                </label>
                                <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
                                    Forgot password?
                                </button>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition text-slate-900 placeholder:text-slate-400"
                                required
                            />
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex justify-center items-center gap-2"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Help */}
                    <p className="mt-8 text-center text-xs text-slate-400">
                        Protected by SecureAttend Systems v2.0
                        <br />
                        Trouble signing in? <button onClick={() => navigate('/contact-support')} className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors">Contact Support</button>.
                    </p>
                </div>
            </div>
        </div>
    );
}
