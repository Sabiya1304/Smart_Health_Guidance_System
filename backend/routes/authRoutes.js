const express = require('express');
const router = express.Router();

const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, age, gender } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.json({
                success: false,
                message: "User already exists"
            });
        }

        const newUser = new User({
            name,
            email,
            password,
            phone,
            age,
            gender
        });

        await newUser.save();

        res.json({
            success: true,
            message: "Registered successfully"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        console.log("Login email:", email);
        console.log("User found:", user);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }
        console.log("Entered Password:", password);
        console.log("Stored Password:", user.password);
        if (user.password !== password) {
            return res.json({
                success: false,
                message: "Wrong password"
            });
        }

        const safeUser = user.toObject();
        delete safeUser.password;

        res.json({
            success: true,
            message: "Login success",
            token: String(user._id),
            user: safeUser,
            profileCompleted: user.profileCompleted
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = router;
