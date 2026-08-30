const express = require("express");
const router = express.Router();
const User = require("../models/User");

function sanitizeUser(user) {
    if (!user) return null;

    const cleanUser = user.toObject ? user.toObject() : { ...user };
    delete cleanUser.password;
    return cleanUser;
}

router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// ================================
// COMPLETE PROFILE
// ================================
router.put("/complete/:id", async (req, res) => {

    try {
        const userId = req.params.id;

        const {
            bloodGroup,
            emergencyContact,
            address,
            height,
            weight
        } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                bloodGroup,
                emergencyContact,
                address,
                height,
                weight,
                profileCompleted: true
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "Profile completed successfully",
            user: sanitizeUser(updatedUser)
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const allowedFields = [
            "name",
            "phone",
            "age",
            "gender",
            "bloodGroup",
            "emergencyContact",
            "address",
            "height",
            "weight"
        ];

        const updates = {};

        allowedFields.forEach(field => {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                updates[field] = req.body[field] || null;
            }
        });

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const hasCompletedProfile = [
            updatedUser.bloodGroup,
            updatedUser.emergencyContact,
            updatedUser.address,
            updatedUser.height,
            updatedUser.weight
        ].every(Boolean);

        if (hasCompletedProfile && !updatedUser.profileCompleted) {
            updatedUser.profileCompleted = true;
            await updatedUser.save();
        }

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: sanitizeUser(updatedUser)
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

module.exports = router;
