import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, FileText } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 py-3 sticky top-0 z-50">
            <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
                <FileText className="w-6 h-6" />
                <span>FormFlow</span>
            </Link>

            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <span className="text-gray-600 text-sm hidden sm:block">{user.email}</span>
                        <button
                            onClick={logout}
                            className="text-gray-500 hover:text-red-500 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </>
                ) : (
                    <div className="flex gap-3">
                        <Link to="/login" className="px-4 py-2 text-sm text-gray-600 hover:text-indigo-600 font-medium">Login</Link>
                        <Link to="/register" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">Get Started</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
