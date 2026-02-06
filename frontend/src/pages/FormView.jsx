import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Flag, Send, ChevronRight, AlertCircle } from 'lucide-react';
import QuestionRenderer from '../components/QuestionRenderer';

const themeColors = {
    default: { bg: 'bg-slate-50', text: 'text-indigo-600', button: 'bg-indigo-600', buttonHover: 'hover:bg-indigo-700', bar: 'bg-indigo-600', textMain: 'text-gray-800' },
    sunny: { bg: 'bg-orange-50', text: 'text-orange-600', button: 'bg-orange-500', buttonHover: 'hover:bg-orange-600', bar: 'bg-orange-500', textMain: 'text-gray-800' },
    ocean: { bg: 'bg-blue-50', text: 'text-blue-600', button: 'bg-blue-600', buttonHover: 'hover:bg-blue-700', bar: 'bg-blue-600', textMain: 'text-gray-800' },
    forest: { bg: 'bg-green-50', text: 'text-green-600', button: 'bg-green-600', buttonHover: 'hover:bg-green-700', bar: 'bg-green-600', textMain: 'text-gray-800' },
    love: { bg: 'bg-pink-50', text: 'text-pink-600', button: 'bg-pink-600', buttonHover: 'hover:bg-pink-700', bar: 'bg-pink-600', textMain: 'text-gray-800' },
    dark: { bg: 'bg-gray-900', text: 'text-indigo-400', button: 'bg-indigo-600', buttonHover: 'hover:bg-indigo-700', bar: 'bg-indigo-600', textMain: 'text-white' },
};

const FormView = () => {
    const { id } = useParams();
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});
    const [flagged, setFlagged] = useState(new Set());
    const [missing, setMissing] = useState(new Set());
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const hasIncremented = useRef(false);
    const questionRefs = useRef([]);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                let url = `/forms/${id}`;
                if (!hasIncremented.current) {
                    url += '?incrementView=true';
                    hasIncremented.current = true;
                }

                const res = await api.get(url);
                setForm(res.data);
            } catch (error) {
                console.error(error);
                setError('Form not found');
            } finally {
                setLoading(false);
            }
        };
        fetchForm();
    }, [id]);

    const handleAnswerChange = (qId, value) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
        if (missing.has(qId)) {
            setMissing(prev => {
                const next = new Set(prev);
                next.delete(qId);
                return next;
            });
        }
    };

    const toggleFlag = (qId) => {
        setFlagged(prev => {
            const next = new Set(prev);
            if (next.has(qId)) next.delete(qId);
            else next.add(qId);
            return next;
        });
    };

    const scrollToQuestion = (index) => {
        questionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const validateForm = () => {
        const missingQs = new Set();
        let firstMissingIdx = -1;

        form.questions.forEach((q, idx) => {
            const qId = q._id || q.id;
            const answer = answers[qId];

            const isEmpty = answer === undefined || answer === null ||
                (typeof answer === 'string' && answer.trim() === '') ||
                (Array.isArray(answer) && answer.length === 0);

            if (q.required && isEmpty) {
                missingQs.add(qId);
                if (firstMissingIdx === -1) firstMissingIdx = idx;
            }
        });

        setMissing(missingQs);

        if (missingQs.size > 0) {
            scrollToQuestion(firstMissingIdx);
            return false;
        }
        return true;
    };

    const submitForm = async () => {
        if (!validateForm()) return;

        try {
            const answersArray = Object.keys(answers).map(key => ({
                questionId: key,
                answer: answers[key]
            }));

            await api.post('/responses', {
                formId: id,
                answers: answersArray
            });
            setSubmitted(true);
        } catch (error) {
            console.error(error);
            if (error.response?.data?.missingFields) {
                setMissing(new Set(error.response.data.missingFields));
                alert('Please fill out all required fields.');
            } else {
                alert('Failed to submit. Please check your connection.');
            }
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (error) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{error}</h1>
            <p className="text-gray-500">The link might be broken or the form has been deleted.</p>
        </div>
    );

    if (submitted) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-indigo-600 text-white p-6 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 text-indigo-600 shadow-2xl"
                >
                    <Check className="w-12 h-12" />
                </motion.div>
                <h1 className="text-5xl font-extrabold mb-4">Success!</h1>
                <p className="text-2xl opacity-90 max-w-md">Your application has been received. Thank you for your time!</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-10 px-8 py-3 bg-white text-indigo-600 rounded-xl font-bold shadow-lg hover:bg-slate-50 transition"
                >
                    Submit Another Response
                </button>
            </div>
        );
    }

    const theme = themeColors[form.theme] || themeColors.default;
    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / form.questions.length) * 100;

    return (
        <div className={`min-h-screen ${theme.bg} transition-colors duration-500 flex flex-col`}>
            {/* Header / Progress bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
                    <div>
                        <h2 className="font-bold text-gray-800 line-truncate max-w-[200px] sm:max-w-md">{form.title}</h2>
                        <p className="text-xs text-gray-400">Section 1 of 1</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-xs font-medium text-gray-500 mb-1">{Math.round(progress)}% Completed</span>
                        <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full ${theme.bar}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex max-w-7xl mx-auto w-full p-4 md:p-8 gap-8 overflow-hidden">
                {/* Main Questions List */}
                <main className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-24">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{form.title}</h1>
                        <p className="text-gray-500">{form.description || "Please fill out all the required questions."}</p>
                    </div>

                    {form.questions.map((q, idx) => {
                        const qId = q._id || q.id;
                        return (
                            <div
                                key={qId}
                                ref={el => questionRefs.current[idx] = el}
                                className={`bg-white p-8 rounded-2xl shadow-sm border-2 transition-all relative group ${missing.has(qId)
                                    ? 'border-red-500 shadow-lg shadow-red-50'
                                    : flagged.has(qId)
                                        ? 'border-orange-200'
                                        : 'border-transparent hover:border-indigo-100'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex flex-col gap-1">
                                        <span className={`w-fit text-sm font-bold px-3 py-1 rounded-full ${theme.text} bg-indigo-50`}>
                                            Question {idx + 1}
                                        </span>
                                        {missing.has(qId) && (
                                            <span className="text-xs font-bold text-red-500 ml-1">
                                                This question is required
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => toggleFlag(qId)}
                                        className={`transition-colors p-2 rounded-lg ${flagged.has(qId)
                                            ? 'text-orange-500 bg-orange-50'
                                            : 'text-gray-300 hover:text-orange-400 hover:bg-gray-50'
                                            }`}
                                        title="Flag for review"
                                    >
                                        <Flag className={`w-5 h-5 ${flagged.has(qId) ? 'fill-current' : ''}`} />
                                    </button>
                                </div>

                                <QuestionRenderer
                                    question={q}
                                    value={answers[qId]}
                                    onChange={(val) => handleAnswerChange(qId, val)}
                                />

                                {flagged.has(qId) && (
                                    <div className="mt-4 flex items-center gap-2 text-xs text-orange-500 font-medium">
                                        <Flag className="w-3 h-3 fill-current" />
                                        <span>Flagged for review</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <div className="pt-8">
                        <button
                            onClick={submitForm}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition flex items-center justify-center gap-2 group"
                        >
                            <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            Submit Form
                        </button>
                    </div>
                </main>

                {/* Right Sidebar Navigation */}
                <aside className="hidden lg:block w-72 shrink-0 h-fit sticky top-24">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
                            Question Map
                            <span className="text-xs font-normal text-gray-400">{answeredCount}/{form.questions.length} answered</span>
                        </h3>

                        <div className="grid grid-cols-5 gap-3">
                            {form.questions.map((q, idx) => {
                                const qId = q._id || q.id;
                                const isAnswered = answers[qId] !== undefined && answers[qId] !== '' && (!Array.isArray(answers[qId]) || answers[qId].length > 0);
                                const isFlagged = flagged.has(qId);

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => scrollToQuestion(idx)}
                                        className={`w-10 h-10 rounded-xl text-sm font-bold flex items-center justify-center transition-all relative ${missing.has(qId)
                                            ? 'bg-red-50 text-red-600 border-2 border-red-200'
                                            : isFlagged
                                                ? 'bg-orange-50 text-orange-600 border-2 border-orange-200'
                                                : isAnswered
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-50 text-gray-400 border border-gray-100 hover:border-indigo-200'
                                            }`}
                                    >
                                        {idx + 1}
                                        {isFlagged && isAnswered && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                                                <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-8 space-y-3 pt-6 border-t border-gray-50">
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="w-3 h-3 bg-indigo-600 rounded" />
                                <span>Answered</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="w-3 h-3 bg-red-50 border border-red-200 rounded" />
                                <span>Required/Missing</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="w-3 h-3 bg-orange-50 border border-orange-200 rounded" />
                                <span>Flagged</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="w-3 h-3 bg-gray-50 border border-gray-100 rounded" />
                                <span>Not Started</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                        <p className="text-sm text-indigo-900 font-medium mb-2">Ready to finish?</p>
                        <p className="text-xs text-indigo-700 opacity-80 mb-4">Ensure all required questions are answered before submitting.</p>
                        <button
                            onClick={submitForm}
                            className="w-full bg-indigo-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition"
                        >
                            Quick Submit
                        </button>
                    </div>
                </aside>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}} />
        </div>
    );
};

export default FormView;
