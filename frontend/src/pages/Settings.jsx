import React, { useState } from 'react';
import { User, Mail, Shield, Bell, Key, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Settings = () => {
    const { user, updateProfile } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        if (password && password !== confirmPassword) {
            return setStatus({ type: 'error', message: 'Passwords do not match' });
        }

        setLoading(true);
        try {
            await updateProfile({ name, password });
            setStatus({ type: 'success', message: 'Profile updated successfully!' });
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to update profile'
            });
        } finally {
            setLoading(false);
            setTimeout(() => setStatus({ type: '', message: '' }), 5000);
        }
    };

    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 text-center"
            >
                <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Account Settings</h1>
                <p className="text-sm text-gray-500">Keep your professional profile and security up to date.</p>
            </motion.div>

            <AnimatePresence>
                {status.message && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`mb-8 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${status.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-100'
                            : 'bg-red-50 text-red-700 border border-red-100'
                            }`}
                    >
                        {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        {status.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
                <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl shadow-gray-100/50">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                            <User className="w-4 h-4" />
                        </div>
                        Edit Profile
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-extrabold text-gray-400 mb-1.5 uppercase tracking-widest px-1">Full Name / Display Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none font-medium text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-extrabold text-gray-400 mb-1.5 uppercase tracking-widest px-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    defaultValue={user?.email || ''}
                                    disabled
                                    className="w-full pl-11 pr-4 py-3 bg-gray-100 border border-gray-100 rounded-xl text-gray-400 cursor-not-allowed font-medium text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl shadow-gray-100/50">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                            <Key className="w-4 h-4" />
                        </div>
                        Update Password
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-extrabold text-gray-400 mb-1.5 uppercase tracking-widest px-1">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none font-medium tracking-widest text-indigo-600 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-extrabold text-gray-400 mb-1.5 uppercase tracking-widest px-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none font-medium tracking-widest text-indigo-600 text-sm"
                            />
                        </div>
                    </div>
                </section>

                <div className="flex items-center justify-end gap-5 pt-2">
                    <Link to="/" className="text-[10px] font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest">
                        Cancel Changes
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                        <span>Save Profile</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
