import React from 'react';

const QuestionRenderer = ({ question, value, onChange }) => {
    const handleCheckboxChange = (option) => {
        if (!onChange) return;
        const currentValues = Array.isArray(value) ? value : [];
        const newValues = currentValues.includes(option)
            ? currentValues.filter((v) => v !== option)
            : [...currentValues, option];
        onChange(newValues);
    };

    return (
        <div className="mb-4">
            <label className="block text-lg font-semibold text-gray-800 mb-4">
                {question.title} {question.required && <span className="text-red-500">*</span>}
            </label>

            {question.type === 'short' && (
                <input
                    type="text"
                    className="w-full border-b-2 border-gray-200 py-3 focus:border-indigo-600 outline-none transition-colors bg-white hover:bg-gray-50 px-4 rounded-t-lg"
                    placeholder="Type your answer here..."
                    value={value || ''}
                    onChange={(e) => onChange && onChange(e.target.value)}
                />
            )}

            {question.type === 'paragraph' && (
                <textarea
                    className="w-full border-b-2 border-gray-200 py-3 focus:border-indigo-600 outline-none transition-colors bg-white hover:bg-gray-50 px-4 rounded-t-lg resize-none"
                    placeholder="Type your answer here..."
                    rows={4}
                    value={value || ''}
                    onChange={(e) => onChange && onChange(e.target.value)}
                />
            )}

            {question.type === 'mcq' && (
                <div className="space-y-3">
                    {question.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => onChange && onChange(option)}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${value === option
                                ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                                : 'border-gray-100 bg-white hover:border-indigo-200 hover:bg-gray-50'
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${value === option ? 'border-indigo-600' : 'border-gray-300'
                                }`}>
                                {value === option && <div className="w-3 h-3 rounded-full bg-indigo-600" />}
                            </div>
                            <span className={`text-lg transition-colors ${value === option ? 'text-indigo-900 font-medium' : 'text-gray-700'}`}>
                                {option}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {question.type === 'checkbox' && (
                <div className="space-y-3">
                    {question.options.map((option, idx) => {
                        const isChecked = Array.isArray(value) && value.includes(option);
                        return (
                            <button
                                key={idx}
                                onClick={() => handleCheckboxChange(option)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${isChecked
                                    ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                                    : 'border-gray-100 bg-white hover:border-indigo-200 hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${isChecked ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                                    }`}>
                                    {isChecked && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`text-lg transition-colors ${isChecked ? 'text-indigo-900 font-medium' : 'text-gray-700'}`}>
                                    {option}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {question.type === 'dropdown' && (
                <select
                    value={value || ''}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    className="w-full p-4 rounded-xl border-2 border-gray-100 bg-white focus:border-indigo-600 outline-none transition-all text-lg text-gray-700 cursor-pointer hover:bg-gray-50"
                >
                    <option value="" disabled>Select an option</option>
                    {question.options.map((option, idx) => (
                        <option key={idx} value={option}>{option}</option>
                    ))}
                </select>
            )}
        </div>
    );
};

export default QuestionRenderer;
