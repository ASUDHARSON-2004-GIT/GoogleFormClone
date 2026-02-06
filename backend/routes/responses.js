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
