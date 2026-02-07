import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send, MessageSquare, Phone } from 'lucide-react';

export function ContactSupport() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would send this to a backend API
        console.log("Support Request:", { name, email, message });

        // Simulate API call
        setTimeout(() => {
            setSubmitted(true);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[600px]">

                {/* Left: Contact Info */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <button
                            onClick={() => navigate('/login')}
                            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-8 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Login
                        </button>

                        <h1 className="text-3xl font-bold mb-4">Contact Support</h1>
                        <p className="text-slate-300 leading-relaxed mb-8">
                            Having trouble accessing your account? Our IT support team is here to help you resolve login issues and get back on track.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/10 rounded-xl mt-1">
                                    <Mail className="w-5 h-5 text-blue-300" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Email Us</h3>
                                    <p className="text-slate-400 text-sm">support@university.edu</p>
                                    <p className="text-slate-500 text-xs mt-1">Response within 24 hours</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/10 rounded-xl mt-1">
                                    <Phone className="w-5 h-5 text-blue-300" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Call Helpline</h3>
                                    <p className="text-slate-400 text-sm">+1 (555) 123-4567</p>
                                    <p className="text-slate-500 text-xs mt-1">Mon-Fri, 9am - 5pm</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-12">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            System Status: All Systems Operational
                        </div>
                    </div>
                </div>

                {/* Right: Contact Form */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    {submitted ? (
                        <div className="text-center py-12 animate-fade-in-up">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Send className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h2>
                            <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                                We've received your request and opened a support ticket. Check your email for a confirmation.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                            >
                                Return to Login
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Submit a Request</h2>
                                <p className="text-slate-500 text-sm">
                                    Please provide your details so we can verify your identity.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">University Email (if applicable)</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                                        placeholder="john.doe@university.edu"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Issue Description</label>
                                    <textarea
                                        required
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition resize-none"
                                        placeholder="I can't login with my student ID..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Send Message
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
