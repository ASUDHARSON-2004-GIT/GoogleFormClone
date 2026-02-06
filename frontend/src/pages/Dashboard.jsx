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

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-bold text-gray-800">My Forms</h1>
                <button
                    onClick={createForm}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-semibold"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Form</span>
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center mt-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
            ) : forms.length === 0 ? (
                <div className="text-center mt-20 py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                    <p className="text-xl font-medium text-gray-400">You haven't created any forms yet.</p>
                    <button onClick={createForm} className="mt-4 text-indigo-600 font-bold hover:underline">Create your first form</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {forms.map((form, index) => (
                        <motion.div
                            key={form._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(index * 0.1, 0.8) }}
                            onClick={() => navigate(`/form/${form._id}/edit`)}
                            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group relative flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                                    <FileText className="w-8 h-8" />
                                </div>
                            </div>

                            <h3 className="font-bold text-xl text-gray-800 mb-3 group-hover:text-indigo-600 transition-colors truncate">
                                {form.title || "Untitled Form"}
                            </h3>

                            <p className="text-gray-500 text-sm mb-8 line-clamp-2 min-h-[40px]">
                                {form.description || "No description provided."}
                            </p>

                            <div className="mt-auto pt-6 border-t border-gray-50">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                                        <Eye className="w-3.5 h-3.5" /> {form.views || 0}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                                        <Users className="w-3.5 h-3.5" /> {form.responseCount || 0}
                                    </div>
                                    {form.views > 0 && (
                                        <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100">
                                            {Math.round((form.responseCount || 0) / form.views * 100)}% Conversion
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-400">
                                        {new Date(form.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>

                                    <div className="flex items-center gap-1">
                                        <ShareButton id={form._id} />

                                        <Link
                                            to={`/form/${form._id}/responses`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors"
                                            title="Analytics"
                                        >
                                            <BarChart2 className="w-5 h-5" />
                                        </Link>

                                        <button
                                            onClick={(e) => deleteForm(e, form._id)}
                                            className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
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
