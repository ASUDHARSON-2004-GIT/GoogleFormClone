const express = require('express');
const router = express.Router();
const Response = require('../models/Response');
const Form = require('../models/Form');
const { protect } = require('../middleware/authMiddleware');

// @desc Submit a response
// @route POST /api/responses
// @access Public
router.post('/', async (req, res) => {
    try {
        const { formId, answers } = req.body;

        // Validate form exists
        const form = await Form.findById(formId);
        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }

        // Validate required questions
        const missingRequired = form.questions.filter(q => {
            if (!q.required) return false;

            // Find if this question has an answer in the request
            const answerObj = answers.find(a => a.questionId === q._id.toString() || a.questionId === q.id);

            // Check if answer is present and not empty
            if (!answerObj || answerObj.answer === undefined || answerObj.answer === null) return true;

            if (typeof answerObj.answer === 'string') {
                return answerObj.answer.trim() === '';
            }

            if (Array.isArray(answerObj.answer)) {
                return answerObj.answer.length === 0;
            }

            return false;
        });

        if (missingRequired.length > 0) {
            return res.status(400).json({
                message: 'Please answer all required questions',
                missingFields: missingRequired.map(q => q._id || q.id)
            });
        }

        const response = await Response.create({
            formId,
            answers
        });

        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc Get responses for a form
// @route GET /api/responses/:formId
// @access Private
router.get('/:formId', protect, async (req, res) => {
    try {
        const form = await Form.findById(req.params.formId);

        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }

        if (form.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to view responses for this form' });
        }

        const responses = await Response.find({ formId: req.params.formId }).sort({ submittedAt: -1 });
        res.json(responses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
