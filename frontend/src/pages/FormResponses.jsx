import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';
import { ArrowLeft, Download, FileText, Users, BarChart2, MessageSquare, Eye, TrendingUp, Percent } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

const FormResponses = () => {
    const { id } = useParams();
    const [responses, setResponses] = useState([]);
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' or 'individual'

    const stats = useMemo(() => {
        if (!form) return { views: 0, responses: 0, rate: 0 };
        const views = form.views || 0;
        const respCount = responses.length;
        const rate = views > 0 ? Math.round((respCount / views) * 100) : 0;
        return { views, responses: respCount, rate };
    }, [form, responses]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [formRes, resRes] = await Promise.all([
                    api.get(`/forms/${id}`),
                    api.get(`/responses/${id}`)
                ]);
                setForm(formRes.data);
                setResponses(resRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const downloadCSV = () => {
        if (!responses.length || !form) return;
        const headers = ['Submitted At', ...form.questions.map(q => q.title)];
        const csvRows = [headers.join(',')];
        responses.forEach(r => {
            const row = [
                new Date(r.submittedAt).toLocaleString(),
                ...form.questions.map(q => {
                    const ans = r.answers.find(a => a.questionId === (q._id || q.id));
                    let val = ans ? ans.answer : '';
                    if (Array.isArray(val)) val = val.join('; ');
                    return `"${(val || "").toString().replace(/"/g, '""')}"`;
                })
            ];
            csvRows.push(row.join(','));
        });
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${form.title}_responses.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Memoize chart data to improve performance
    const processedData = useMemo(() => {
        if (!form || !responses.length) return {};
 
        const data = {};
        form.questions.forEach(q => {
            if (['mcq', 'dropdown', 'checkbox'].includes(q.type)) {
                const dataMap = {};
                q.options.forEach(opt => dataMap[opt] = 0);
                responses.forEach(r => {
                    const ans = r.answers.find(a => a.questionId === (q._id || q.id));
                    if (ans) {
                        if (Array.isArray(ans.answer)) {
                            ans.answer.forEach(opt => { if (dataMap[opt] !== undefined) dataMap[opt]++; });
                        } else {
                            if (dataMap[ans.answer] !== undefined) dataMap[ans.answer]++;
                        }
                    }
                });
                data[q._id || q.id] = Object.keys(dataMap).map(key => ({ name: key, value: dataMap[key] }));
            } else {
                data[q._id || q.id] = responses
                    .map(r => r.answers.find(a => a.questionId === (q._id || q.id))?.answer)
                    .filter(a => a && typeof a === 'string' && a.trim() !== '');
            }
        });
        return data;
    }, [form, responses]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!form) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h2 className="text-xl font-bold text-gray-800">Form not found</h2>
                <Link to="/" className="text-indigo-600 hover:underline mt-4 block">Back to Dashboard</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-indigo-600">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">{form.title}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                                    <Users className="w-3 h-3" /> {responses.length} Responses
                                </span>
                                <span className="text-xs text-gray-400">Created on {new Date(form.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-1 rounded-xl flex">
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'analytics' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Summary
                            </button>
                            <button
                                onClick={() => setActiveTab('individual')}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'individual' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Individual
                            </button>
                        </div>
                        <button
                            onClick={downloadCSV}
                            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-100 font-semibold text-sm"
                            disabled={responses.length === 0}
                        >
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-10 pb-20">
                {responses.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No responses yet</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mb-8">Once people start filling out your form, their responses will appear here as beautiful charts.</p>
                        <button
                            onClick={() => {
                                const link = `${window.location.origin}/form/${id}`;
                                navigator.clipboard.writeText(link);
                                alert("Link copied!");
                            }}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition"
                        >
                            Copy Share Link
                        </button>
                    </div>
                ) : activeTab === 'analytics' ? (
                    <div className="space-y-8">
                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5"
                            >
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                    <Eye className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm font-medium">Total Views</p>
                                    <h4 className="text-2xl font-bold text-gray-800">{stats.views}</h4>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5"
                            >
                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                    <Users className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm font-medium">Total Submissions</p>
                                    <h4 className="text-2xl font-bold text-gray-800">{stats.responses}</h4>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5"
                            >
                                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                                    <TrendingUp className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm font-medium">Completion Rate</p>
                                    <div className="flex items-end gap-2">
                                        <h4 className="text-2xl font-bold text-gray-800">{stats.rate}%</h4>
                                        <span className="text-xs text-green-500 font-bold mb-1 flex items-center gap-0.5">
                                            <Percent className="w-3 h-3" /> effective
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Questions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {form.questions.map((q, idx) => {
                                const qId = q._id || q.id;
                                const questionData = processedData[qId];

                                return (
                                    <motion.div
                                        key={qId}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                                        className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full"
                                    >
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                {idx + 1}
                                            </div>
                                            <h3 className="font-bold text-gray-800 line-clamp-2">{q.title}</h3>
                                        </div>

                                        <div className="flex-1 min-h-[300px]">
                                            {['mcq', 'dropdown', 'checkbox'].includes(q.type) ? (
                                                q.type === 'checkbox' ? (
                                                    <ResponsiveContainer width="100%" height={300}>
                                                        <BarChart data={questionData} layout="vertical" margin={{ left: 20 }}>
                                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                                            <XAxis type="number" hide />
                                                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                                            <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <ResponsiveContainer width="100%" height={300}>
                                                        <PieChart>
                                                            <Pie
                                                                data={questionData}
                                                                cx="50%" cy="50%"
                                                                outerRadius={100}
                                                                fill="#8884d8"
                                                                dataKey="value"
                                                                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                                            >
                                                                {questionData?.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                                            <Legend />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                )
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-gray-400 mb-4 px-2">
                                                        <MessageSquare className="w-4 h-4" />
                                                        <span className="text-sm font-medium">{questionData?.length || 0} total responses</span>
                                                    </div>
                                                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                                        {questionData?.slice(0, 5).map((resp, rIdx) => (
                                                            <div key={rIdx} className="p-3 bg-gray-50 rounded-xl text-sm text-gray-600 border border-gray-100">
                                                                {resp}
                                                            </div>
                                                        ))}
                                                        {(questionData?.length || 0) > 5 && (
                                                            <p className="text-center text-xs text-gray-400 pt-2">+ {questionData.length - 5} more</p>
                                                        )}
                                                        {(!questionData || questionData.length === 0) && (
                                                            <p className="text-center text-gray-400 italic py-10">No answers yet</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {responses.map((resp, rIdx) => (
                            <div key={resp._id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                            {rIdx + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">Submission #{responses.length - rIdx}</h3>
                                            <p className="text-xs text-gray-400">{new Date(resp.submittedAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full uppercase tracking-wider">Completed</span>
                                </div>
                                <div className="space-y-6">
                                    {form.questions.map((q, qIdx) => {
                                        const ans = resp.answers.find(a => a.questionId === (q._id || q.id));
                                        return (
                                            <div key={q._id || q.id}>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Q{qIdx + 1}: {q.title}</label>
                                                <div className="p-4 bg-gray-50 rounded-2xl text-gray-700 font-medium">
                                                    {ans ? (Array.isArray(ans.answer) ? ans.answer.join(', ') : ans.answer) : <span className="italic text-gray-300">No answer provided</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
            `}} />
        </div>
    );
};

export default FormResponses;
