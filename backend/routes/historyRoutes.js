const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const History = require('../models/History');

router.post('/save', async (req, res) => {
    try {
        const { userId, disease, symptoms, severity } = req.body;

        if (!userId || !disease || !Array.isArray(symptoms) || symptoms.length === 0 || !severity) {
            return res.status(400).json({
                success: false,
                message: "userId, disease, symptoms and severity are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid userId"
            });
        }

        const existingHistory = await History.findOne({
            userId,
            disease,
            symptoms,
            severity
        }).sort({ createdAt: -1 });

        if (existingHistory) {
            return res.json({
                success: true,
                duplicate: true,
                message: "History already saved",
                history: existingHistory
            });
        }

        const newHistory = new History({
            userId,
            disease,
            symptoms,
            severity
        });

        await newHistory.save();

        res.json({
            success: true,
            message: "History saved successfully",
            history: newHistory
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to save history",
            error: err.message
        });
    }
});

router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid userId"
            });
        }

        const history = await History.find({ userId })
            .sort({ date: -1 });

        res.json(history);

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch history",
            error: err.message
        });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await History.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "History deleted"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to delete history",
            error: err.message
        });
    }
});

router.delete('/clear/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        await History.deleteMany({ userId });

        res.json({
            success: true,
            message: "All history cleared"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to clear history",
            error: err.message
        });
    }
});

module.exports = router;
