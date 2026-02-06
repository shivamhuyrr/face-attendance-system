import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, Users, ArrowRight, CheckCircle, Lock } from 'lucide-react';

export function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Gradients (matches StudentDashboard) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200 rounded-full blur-[120px] opacity-30 animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200 rounded-full blur-[120px] opacity-30 animate-pulse delay-1000"></div>
            </div>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 flex flex-col items-center text-center px-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-8 animate-fade-in-up">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Next-Gen Face Recognition System
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight max-w-4xl">
                    Secure Attendance, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        Zero Friction.
                    </span>
                </h1>

                <p className="text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
                    Eliminate proxy attendance and streamline your campus management with our AI-powered biometric system. Fast, secure, and purely contactless.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <button
                        onClick={() => navigate('/login')}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group"
                    >
                        Get Started
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-bold text-lg shadow-sm transition-all"
                    >
                        Learn More
                    </button>
                </div>

                {/* Hero Visual/Stats */}
                <div className="mt-20 w-full max-w-5xl relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent z-10"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-xl">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">99.9%</div>
                            <div className="text-gray-500 font-medium">Recognition Accuracy</div>
                        </div>
                        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-xl">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">&lt; 1s</div>
                            <div className="text-gray-500 font-medium">Processing Time</div>
                        </div>
                        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-xl">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">100%</div>
                            <div className="text-gray-500 font-medium">Spoof Prevention</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 px-4 bg-white/40 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose SecureAttend?</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Built directly for modern educational institutions and enterprises.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<ShieldCheck className="w-6 h-6 text-blue-600" />}
                            title="Enterprise Security"
                            description="Bank-grade encryption for all facial data. Your biometric information never leaves our secured private cloud."
                        />
                        <FeatureCard
                            icon={<Users className="w-6 h-6 text-purple-600" />}
                            title="Multi-User Support"
                            description="Seamlessly manage Students, Faculty, and Admin roles with dedicated dashboards and permissions."
                        />
                        <FeatureCard
                            icon={<Zap className="w-6 h-6 text-yellow-600" />}
                            title="Real-Time Analytics"
                            description="Instant attendance logging with detailed reports, monthly stats, and exportable data formats."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 text-center text-gray-500 text-sm bg-white/50 border-t border-gray-100">
                <p>&copy; 2024 SecureAttend System. All rights reserved.</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-white/70 backdrop-blur-lg p-8 rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-shadow group">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
