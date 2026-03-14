import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, FileText, LayoutDashboard, Database, Settings as SettingsIcon, Menu, X, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Responses', path: '/responses', icon: Database },
    ];


    const isActive = (path) => location.pathname === path;

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm py-2' : 'bg-transparent py-3'}`}>
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-200">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-gray-900 font-black text-xl tracking-tight">FormFlow</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-2xl border border-gray-100/50">
                        {user && navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${isActive(link.path)
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                                    }`}
                            >
                                <link.icon className="w-4 h-4" />
                                <span>{link.name}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold group-hover:rotate-6 transition-transform">
                                        {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                                    </div>
                                    <div className="hidden lg:flex flex-col items-start leading-tight">
                                        <span className="text-sm font-bold text-gray-900">{user.name || 'User'}</span>
                                        <span className="text-[10px] text-gray-500 font-medium tracking-wide">Account</span>
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {isMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setIsMenuOpen(false)}
                                            ></div>
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                                            >
                                                <div className="p-4 border-b border-gray-50">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
                                                    <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                                                </div>
                                                <div className="p-2">
                                                    <Link
                                                        to="/settings"
                                                        onClick={() => setIsMenuOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors"
                                                    >
                                                        <SettingsIcon className="w-4 h-4" />
                                                        Account Settings
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            setIsMenuOpen(false);
                                                            logout();
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Logout
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <Link to="/login" className="px-5 py-2.5 text-sm text-gray-600 hover:text-indigo-600 font-bold">Login</Link>
                                <Link to="/register" className="px-6 py-2.5 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 font-bold">Get Started</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden mt-4 overflow-hidden"
                        >
                            <div className="flex flex-col gap-2 pb-6">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center gap-3 p-4 rounded-xl text-base font-bold transition-all ${isActive(link.path)
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                            : 'bg-white text-gray-600 border border-gray-100'
                                            }`}
                                    >
                                        <link.icon className="w-5 h-5" />
                                        <span>{link.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};

export default Navbar;

