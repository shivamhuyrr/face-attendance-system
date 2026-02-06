import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, User, BookOpen } from 'lucide-react';


export function Navbar() {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path ? "bg-blue-700" : "hover:bg-blue-600";

    return (
        <nav className="bg-blue-600 text-white shadow-lg">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-2 font-bold text-xl">
                    <ShieldCheck className="w-8 h-8" />
                    <span>SecureAttend</span>
                </div>
                <div className="flex space-x-4">

                    {/* Admin Links */}
                    {location.pathname.startsWith('/admin') && (
                        <Link to="/admin" className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${isActive('/admin')}`}>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Admin Dashboard</span>
                        </Link>
                    )}

                    {/* Student Links */}
                    {location.pathname.startsWith('/student') && (
                        <Link to="/student" className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${isActive('/student')}`}>
                            <User className="w-4 h-4" />
                            <span>My Dashboard</span>
                        </Link>
                    )}

                    {/* Faculty Links */}
                    {location.pathname.startsWith('/faculty') && (
                        <Link to="/faculty" className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${isActive('/faculty')}`}>
                            <BookOpen className="w-4 h-4" />
                            <span>Faculty Portal</span>
                        </Link>
                    )}

                    {/* Support Links */}
                    {location.pathname.startsWith('/support') && (
                        <Link to="/support" className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${isActive('/support')}`}>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Support Console</span>
                        </Link>
                    )}

                    {/* Login Link (if at root or login) */}
                    {(location.pathname === '/' || location.pathname.includes('/login')) && (
                        <span className="text-gray-200 text-sm">Select a portal to login</span>
                    )}

                </div>
            </div>
        </nav>
    );
}
