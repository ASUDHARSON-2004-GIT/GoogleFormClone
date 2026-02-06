const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    id: { type: String, required: true }, // Frontend generated ID for generic usage
    type: {
        type: String,
        enum: ['short', 'paragraph', 'mcq', 'checkbox', 'dropdown'],
        required: true
    },
    title: { type: String, required: true },
    options: [{ type: String }], // For MCQ, Checkbox, Dropdown
    required: { type: Boolean, default: false }
});

const FormSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: 'Untitled Form'
    },
    description: {
        type: String,
        default: ''
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questions: [QuestionSchema],
    theme: {
        type: String,
        default: 'default' // default, sunny, ocean, forest, dark
    },
    published: {
        type: Boolean,
        default: true
    },
    views: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Form', FormSchema);
