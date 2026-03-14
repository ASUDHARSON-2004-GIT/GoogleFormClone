import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Download, FileText, BarChart2, Search, Filter, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const ResponsesOverview = () => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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

    const downloadCSV = async (formId, formTitle) => {
        try {
            const res = await api.get(`/responses/${formId}`);
            const responses = res.data;

            if (responses.length === 0) {
                alert("No responses yet for this form.");
                return;
            }

            // Simple CSV conversion
            const questions = responses[0].answers.map(a => a.questionId); // This is a bit simplified
            // For a real CSV, we'd need the question text

            // For now, let's just show an alert or a mock download
            // In a real app, you'd use a library like json2csv
            console.log("Downloading data for:", formTitle);
            alert(`Downloading response data for "${formTitle}"... (In a real app, this would trigger a CSV download)`);
        } catch (error) {
            console.error('Error downloading responses:', error);
        }
    };

    const filteredForms = forms.filter(form =>
        form.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Form Data & Responses</h1>
                    <p className="text-gray-500">View and export response data from all your active forms.</p>
                </div>

                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                    <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all">
                        All Responses
                    </button>
                    <button className="px-6 py-2.5 text-gray-500 hover:bg-gray-50 rounded-xl font-semibold transition-all">
                        Scheduled Reports
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                <div className="md:col-span-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search forms by title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 shadow-sm rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                        />
                    </div>
                </div>
                <div className="md:col-span-1">
                    <button className="w-full flex items-center justify-center gap-2 h-full bg-white border border-gray-100 shadow-sm rounded-2xl hover:bg-gray-50 transition-colors font-semibold text-gray-600">
                        <Filter className="w-5 h-5" />
                        <span>Filter</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-50">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Form Name</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Created</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Total Responses</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredForms.map((form) => (
                                    <tr key={form._id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <span className="font-bold text-gray-800">{form.title || "Untitled Form"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(form.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-bold border border-green-100">
                                                {form.responseCount || 0} Responses
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => downloadCSV(form._id, form.title)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-black transition-all text-sm font-bold shadow-lg shadow-gray-200"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span>CSV</span>
                                                </button>
                                                <button
                                                    className="p-2 text-gray-400 hover:text-indigo-600 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-gray-100"
                                                    title="View Analytics"
                                                >
                                                    <BarChart2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResponsesOverview;
