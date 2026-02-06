import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, GripVertical, Save, Eye, Share2, ArrowLeft, Palette, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionRenderer from '../components/QuestionRenderer';

const themes = {
    default: { name: 'Default', color: 'bg-indigo-600' },
    sunny: { name: 'Sunny', color: 'bg-orange-500' },
    ocean: { name: 'Ocean', color: 'bg-blue-600' },
    forest: { name: 'Forest', color: 'bg-green-600' },
    love: { name: 'Love', color: 'bg-pink-600' },
    dark: { name: 'Dark', color: 'bg-gray-800' },
};

// Sortable Item Component
const SortableQuestion = ({ question, index, updateQuestion, deleteQuestion, activeId }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleChange = (field, value) => {
        updateQuestion(question.id, { ...question, [field]: value });
    };

    const handleOptionChange = (optIndex, value) => {
        const newOptions = [...question.options];
        newOptions[optIndex] = value;
        updateQuestion(question.id, { ...question, options: newOptions });
    };

    const addOption = () => {
        updateQuestion(question.id, { ...question, options: [...question.options, `Option ${question.options.length + 1}`] });
    };

    const removeOption = (optIndex) => {
        const newOptions = question.options.filter((_, i) => i !== optIndex);
        updateQuestion(question.id, { ...question, options: newOptions });
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4 relative group">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move text-gray-300 hover:text-gray-500" {...attributes} {...listeners}>
                <GripVertical />
            </div>

            <div className="pl-8">
                <div className="flex gap-4 mb-4">
                    <input
                        type="text"
                        value={question.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="flex-1 text-lg font-medium border-b border-transparent focus:border-indigo-500 outline-none bg-gray-50 focus:bg-white p-2 transition-colors rounded"
                        placeholder="Question Title"
                    />
                    <select
                        value={question.type}
                        onChange={(e) => handleChange('type', e.target.value)}
                        className="border border-gray-200 rounded px-3 py-1 outline-none focus:border-indigo-500"
                    >
                        <option value="short">Short Answer</option>
                        <option value="paragraph">Paragraph</option>
                        <option value="mcq">Multiple Choice</option>
                        <option value="checkbox">Checkboxes</option>
                        <option value="dropdown">Dropdown</option>
                    </select>
                </div>

                {['mcq', 'checkbox', 'dropdown'].includes(question.type) && (
                    <div className="space-y-2 mb-4">
                        {question.options.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="w-4 h-4 border border-gray-300 rounded-full" />
                                <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                    className="flex-1 border-b border-gray-200 focus:border-indigo-500 outline-none text-sm py-1"
                                />
                                <button onClick={() => removeOption(idx)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button onClick={addOption} className="text-sm text-indigo-600 font-medium hover:underline pl-6">
                            + Add Option
                        </button>
                    </div>
                )}

                <div className="flex justify-end items-center gap-4 pt-4 border-t border-gray-100">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={question.required}
                            onChange={(e) => handleChange('required', e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        Required
                    </label>
                    <button onClick={() => deleteQuestion(question.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Helper Component
const FormBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('Untitled Form');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [theme, setTheme] = useState('default');
    const [showThemeSelector, setShowThemeSelector] = useState(false);
    const [copied, setCopied] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (id === 'new') {
            setLoading(false);
            return;
        }
        const fetchForm = async () => {
            try {
                const res = await api.get(`/forms/${id}`);
                setTitle(res.data.title);
                setDescription(res.data.description);
                setTheme(res.data.theme || 'default');
                // Ensure questions have frontend IDs
                setQuestions(res.data.questions.map(q => ({ ...q, id: q._id || q.id || Math.random().toString(36).substr(2, 9) })));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchForm();
    }, [id]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setQuestions((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
        setActiveId(null);
    };

    const addQuestion = () => {
        const newQuestion = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'short',
            title: 'Untitled Question',
            options: ['Option 1'],
            required: false
        };
        setQuestions([...questions, newQuestion]);
    };

    const updateQuestion = (qId, updatedQ) => {
        setQuestions(questions.map(q => q.id === qId ? updatedQ : q));
    };

    const deleteQuestion = (qId) => {
        setQuestions(questions.filter(q => q.id !== qId));
    };

    const saveForm = async () => {
        try {
            const payload = {
                title,
                description,
                questions,
                theme
            };
            await api.put(`/forms/${id}`, payload);
            alert('Form saved successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to save form');
        }
    };

    const copyLink = () => {
        const link = `${window.location.origin}/form/${id}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Height 100vh with flex */}
            <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="text-gray-500 hover:text-indigo-600">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="font-bold text-xl outline-none focus:border-b-2 focus:border-indigo-600 bg-transparent"
                    />
                </div>
                <div className="flex gap-2 relative">
                    <button onClick={() => setShowThemeSelector(!showThemeSelector)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                        <Palette className="w-5 h-5" />
                    </button>

                    {showThemeSelector && (
                        <div className="absolute top-12 right-0 bg-white shadow-xl border border-gray-100 rounded-xl p-4 w-48 z-50">
                            <h3 className="text-sm font-semibold text-gray-600 mb-3">Select Theme</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {Object.entries(themes).map(([key, val]) => (
                                    <button
                                        key={key}
                                        onClick={() => { setTheme(key); setShowThemeSelector(false); }}
                                        className={`w-10 h-10 rounded-full ${val.color} ${theme === key ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                        title={val.name}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <button onClick={() => window.open(`/form/${id}`, '_blank')} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Preview</span>
                    </button>
                    <button
                        onClick={copyLink}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${copied ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
                    </button>
                    <button onClick={saveForm} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Builder Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-xl shadow-sm border-t-8 border-t-indigo-600 p-6 mb-6">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-3xl font-bold outline-none mb-2"
                                placeholder="Form Title"
                            />
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full text-gray-500 outline-none"
                                placeholder="Form Description"
                            />
                        </div>

                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                                {questions.map((q, index) => (
                                    <SortableQuestion
                                        key={q.id}
                                        question={q}
                                        index={index}
                                        updateQuestion={updateQuestion}
                                        deleteQuestion={deleteQuestion}
                                        activeId={activeId}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={addQuestion}
                            className="w-full py-4 border-2 border-dashed border-indigo-200 rounded-xl text-indigo-500 font-medium hover:bg-indigo-50 hover:border-indigo-400 transition flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" /> Add Question
                        </motion.button>
                    </div>
                </main>

                {/* Right Preview Side */}
                <aside className="w-[400px] bg-white border-l border-gray-200 hidden xl:flex flex-col shadow-xl z-20">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-semibold text-gray-700">Live Preview</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                        <div className="bg-white rounded-lg shadow-sm p-6 pointer-events-none opacity-90 scale-[0.9] origin-top">
                            <h1 className="text-2xl font-bold mb-2">{title}</h1>
                            <p className="text-gray-500 mb-6">{description}</p>
                            {questions.map(q => (
                                <QuestionRenderer key={q.id} question={q} />
                            ))}
                            <button className="bg-indigo-600 text-white px-6 py-2 rounded mt-4 opacity-50">Submit</button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default FormBuilder;
