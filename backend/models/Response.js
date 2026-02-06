const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
    formId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form',
        required: true
    },
    answers: [{
        questionId: { type: String, required: true },
        answer: mongoose.Schema.Types.Mixed // String or Array of Strings
    }],
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Response', ResponseSchema);
