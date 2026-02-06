const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const Response = require('../models/Response');
const { protect } = require('../middleware/authMiddleware');

// @desc Get all forms for a user
// @route GET /api/forms
// @access Private
router.get('/', protect, async (req, res) => {
    try {
        const forms = await Form.find({ user: req.user.id }).sort({ createdAt: -1 });

        // Add response count to each form
        const formsWithStats = await Promise.all(forms.map(async (form) => {
            const responseCount = await Response.countDocuments({ formId: form._id });
            return {
                ...form._doc,
                responseCount
            };
        }));

        res.json(formsWithStats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc Get single form (Public/Private)
// @route GET /api/forms/:id
// @access Public
router.get('/:id', async (req, res) => {
    try {
        let form;
        if (req.query.incrementView === 'true') {
            form = await Form.findByIdAndUpdate(
                req.params.id,
                { $inc: { views: 1 } },
                { new: true }
            );
        } else {
            form = await Form.findById(req.params.id);
        }

        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }
        res.json(form);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc Create a form
// @route POST /api/forms
// @access Private
router.post('/', protect, async (req, res) => {
    try {
        const form = await Form.create({
            user: req.user.id,
            title: 'Untitled Form',
            description: 'Form Description',
            questions: []
        });
        res.status(201).json(form);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc Update a form
// @route PUT /api/forms/:id
// @access Private
router.put('/:id', protect, async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);

        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }

        if (form.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Update fields
        form.title = req.body.title || form.title;
        form.description = req.body.description || form.description;
        form.questions = req.body.questions || form.questions;
        // form.published = req.body.published ...

        const updatedForm = await form.save();
        res.json(updatedForm);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc Delete a form
// @route DELETE /api/forms/:id
// @access Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);

        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }

        if (form.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await form.deleteOne();
        res.json({ message: 'Form removed' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
