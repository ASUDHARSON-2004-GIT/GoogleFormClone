import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, FileText, Trash2, Edit, BarChart2, Share2, Check, Eye, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const ShareButton = ({ id }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const link = `${window.location.origin}/form/${id}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className={`p-2 rounded-full transition relative ${copied ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
            title="Copy Share Link"
        >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied && (
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10"
                >
                    Copied!
                </motion.span>
            )}
        </button>
    );
};

const Dashboard = () => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const res = await api.get('/forms');
                setForms(res.data);
            } catch (error) {
                console.error('Error fetching forms:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchForms();
    }, []);

    const createForm = async () => {
        try {
            const res = await api.post('/forms');
            navigate(`/form/${res.data._id}/edit`);
        } catch (error) {
            console.error('Error creating form:', error);
        }
    };

    const deleteForm = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this form?")) return;

        api.delete(`/forms/${id}`)
            .then(() => {
                setForms(prev => prev.filter(f => f._id !== id));
            })
            .catch(err => console.error('Error deleting form:', err));
    };

    const totalResponses = forms.reduce((acc, form) => acc + (form.responseCount || 0), 0);
    const totalViews = forms.reduce((acc, form) => acc + (form.views || 0), 0);

    return (
        <div className="container mx-auto px-6 py-12">
            <header className="mb-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Welcome back!</h1>
                        <p className="text-sm text-gray-500 font-medium">You have {forms.length} active forms and {totalResponses} total responses.</p>
                    </div>
                    <button
                        onClick={createForm}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 font-bold text-sm group"
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        <span>Create New Form</span>
                    </button>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Forms</p>
                        <h3 className="text-xl font-black text-gray-900">{forms.length}</h3>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Views</p>
                        <h3 className="text-xl font-black text-gray-900">{totalViews}</h3>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Responses</p>
                        <h3 className="text-xl font-black text-gray-900">{totalResponses}</h3>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Avg. Conversion</p>
                        <h3 className="text-xl font-black text-gray-900">
                            {totalViews > 0 ? Math.round((totalResponses / totalViews) * 100) : 0}%
                        </h3>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : forms.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-32 bg-white rounded-[40px] border border-dashed border-gray-200 shadow-inner"
                >
                    <div className="bg-indigo-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
                        <FileText className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No forms found</h2>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium text-lg">Start collecting data by creating your first professional form in seconds.</p>
                    <button onClick={createForm} className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200">
                        Get Started
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {forms.map((form, index) => (
                        <motion.div
                            key={form._id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(index * 0.1, 0.8), duration: 0.5, ease: "easeOut" }}
                            onClick={() => navigate(`/form/${form._id}/edit`)}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group relative flex flex-col h-full overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <ShareButton id={form._id} />
                            </div>

                            <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors mb-4 shadow-sm">
                                <FileText className="w-6 h-6" />
                            </div>

                            <h3 className="font-black text-xl text-gray-900 mb-1.5 group-hover:text-indigo-600 transition-colors truncate">
                                {form.title || "Untitled Form"}
                            </h3>

                            <p className="text-sm text-gray-500 font-medium line-clamp-2 min-h-[40px] mb-6 leading-relaxed">
                                {form.description || "No description provided for this form."}
                            </p>

                            <div className="mt-auto">
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-gray-50 rounded-2xl p-4 transition-colors group-hover:bg-white border border-transparent group-hover:border-gray-100">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <Eye className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Views</span>
                                        </div>
                                        <p className="text-xl font-black text-gray-900">{form.views || 0}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4 transition-colors group-hover:bg-white border border-transparent group-hover:border-gray-100">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <Users className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Responses</span>
                                        </div>
                                        <p className="text-xl font-black text-gray-900">{form.responseCount || 0}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                    <span className="text-xs font-bold text-gray-400 tracking-wide">
                                        {new Date(form.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={`/form/${form._id}/responses`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-3 text-gray-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100"
                                            title="Analytics"
                                        >
                                            <BarChart2 className="w-5 h-5" />
                                        </Link>

                                        <button
                                            onClick={(e) => deleteForm(e, form._id)}
                                            className="p-3 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};


export default Dashboard;
