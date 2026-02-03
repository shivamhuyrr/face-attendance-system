import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, User } from 'lucide-react';

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
                    <Link to="/admin" className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${isActive('/admin')}`}>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Admin</span>
                    </Link>
                    <Link to="/user" className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${isActive('/user')}`}>
                        <User className="w-4 h-4" />
                        <span>My Logs</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
